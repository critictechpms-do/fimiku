import logging
import os

import requests
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)
BASE_URL = "https://apiv2.shiprocket.in/v1/external"
TOKEN_CACHE_KEY = "fimiku_shiprocket_api_token"


def get_shiprocket_token():
    token = cache.get(TOKEN_CACHE_KEY)
    if token:
        return token

    email = getattr(settings, "SHIPROCKET_EMAIL", "") or os.getenv(
        "SHIPROCKET_EMAIL", ""
    )
    password = getattr(settings, "SHIPROCKET_PASSWORD", "") or os.getenv(
        "SHIPROCKET_PASSWORD", ""
    )
    if not email or not password:
        raise RuntimeError("Shiprocket credentials are not configured.")

    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=20,
    )
    response.raise_for_status()
    token = response.json().get("token")
    if not token:
        raise RuntimeError("Shiprocket did not return an authentication token.")

    # Cache for less than the documented token lifetime.
    cache.set(TOKEN_CACHE_KEY, token, 8 * 24 * 60 * 60)
    return token


def shiprocket_request(method, endpoint, **kwargs):
    token = get_shiprocket_token()
    headers = dict(kwargs.pop("headers", {}))
    headers["Authorization"] = f"Bearer {token}"
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"

    response = requests.request(
        method, url, headers=headers, timeout=30, **kwargs
    )
    if response.status_code == 401:
        cache.delete(TOKEN_CACHE_KEY)
        headers["Authorization"] = f"Bearer {get_shiprocket_token()}"
        response = requests.request(
            method, url, headers=headers, timeout=30, **kwargs
        )
    response.raise_for_status()
    return response.json()


def create_shiprocket_order(order):
    """Create a Shiprocket order; courier assignment/pickup are separate."""
    if order.shiprocket_order_id and order.shiprocket_shipment_id:
        return {
            "success": True,
            "already_created": True,
            "shiprocket_order_id": order.shiprocket_order_id,
            "shipment_id": order.shiprocket_shipment_id,
        }

    pickup_location = getattr(
        settings, "SHIPROCKET_PICKUP_LOCATION", ""
    ).strip()
    if not pickup_location:
        raise RuntimeError(
            "SHIPROCKET_PICKUP_LOCATION is not configured."
        )

    items = list(order.items.select_related("product").all())
    if not items:
        raise RuntimeError("Cannot create a Shiprocket order without items.")

    name_parts = (order.full_name or "Customer").strip().split()
    first_name = name_parts[0] if name_parts else "Customer"
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
    phone = "".join(c for c in str(order.phone or "") if c.isdigit())
    pincode = "".join(c for c in str(order.postal_code or "") if c.isdigit())
    if len(phone) < 10 or len(phone) > 15:
        raise RuntimeError("Order has an invalid customer phone number.")
    if len(pincode) != 6:
        raise RuntimeError("Order must have a valid 6-digit Indian pincode.")

    order_items = []
    for item in items:
        sku = getattr(item.product, "sku", "") if item.product else ""
        sku = sku or f"FIMIKU-ITEM-{item.id}"
        order_items.append({
            "name": str(item.product_name)[:200],
            "sku": str(sku)[:60],
            "units": int(item.quantity),
            "selling_price": float(item.price),
        })

    payment_method = "COD" if str(order.payment_status).upper() == "COD" else "Prepaid"
    created_at = order.created_at or timezone.now()
    payload = {
        "order_id": f"FIMIKU-{order.id}",
        "order_date": timezone.localtime(created_at).strftime("%Y-%m-%d %H:%M"),
        "pickup_location": pickup_location,
        "billing_customer_name": first_name,
        "billing_last_name": last_name,
        "billing_address": str(order.shipping_address or "")[:200],
        "billing_city": str(order.city or ""),
        "billing_pincode": pincode,
        "billing_state": str(order.state or ""),
        "billing_country": "India",
        "billing_email": str(order.email or ""),
        "billing_phone": phone,
        "shipping_is_billing": True,
        "order_items": order_items,
        "payment_method": payment_method,
        "sub_total": float(order.total_amount),
        "total_discount": float(order.discount_amount or 0),
        "length": float(os.getenv("SHIPROCKET_LENGTH_CM", "20")),
        "breadth": float(os.getenv("SHIPROCKET_BREADTH_CM", "15")),
        "height": float(os.getenv("SHIPROCKET_HEIGHT_CM", "10")),
        "weight": float(os.getenv("SHIPROCKET_WEIGHT_KG", "0.5")),
    }

    result = shiprocket_request(
        "POST", "/orders/create/adhoc", json=payload
    )
    shiprocket_order_id = result.get("order_id")
    shipment_id = result.get("shipment_id")
    if not shiprocket_order_id or not shipment_id:
        raise RuntimeError(
            "Shiprocket response did not include order_id and shipment_id. "
            "Check the Shiprocket API response in server logs."
        )

    order.shiprocket_order_id = str(shiprocket_order_id)
    order.shiprocket_shipment_id = str(shipment_id)
    order.save(update_fields=["shiprocket_order_id", "shiprocket_shipment_id"])
    return {
        "success": True,
        "shiprocket_order_id": str(shiprocket_order_id),
        "shipment_id": str(shipment_id),
    }


def try_create_shiprocket_order(order):
    """Log Shiprocket errors without failing an already-created checkout."""
    try:
        return create_shiprocket_order(order)
    except Exception:
        logger.exception("Shiprocket order creation failed for Fimiku order %s", order.id)
        return {"success": False, "message": "Shiprocket creation failed"}
