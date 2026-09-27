'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Check, Headphones, Award, ArrowRight, Leaf, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 2xl:px-10 py-10 space-y-12 bg-fimiku-softLavender pb-20">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-fimiku-darkText flex items-center gap-2">
            About Fimiku <Heart className="w-6 h-6 text-fimiku-primary fill-fimiku-primary/20" />
          </h1>
          <p className="text-sm sm:text-base text-fimiku-secondaryText leading-relaxed">
            Fimiku is a premium baby brand dedicated to creating safe, soft, and pure silicone toys designed for your baby&apos;s everyday comfort.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-fimiku-secondaryText leading-relaxed">
          <p>
            Crafted using 100% food-grade silicone, our products are gentle, non-toxic, and completely safe for newborns and toddlers. Every item is thoughtfully designed to ensure a perfect balance of safety, durability, and ease of use, giving parents peace of mind while their little ones explore, play, and grow.
          </p>
          <p>
            At Fimiku, we believe that babies deserve the safest start in life. That&apos;s why all our products are made from BPA-free, chemical-free silicone that is soft on delicate gums and skin. Our materials are carefully selected to meet high safety standards, ensuring they are free from harmful substances like PVC and phthalates.
          </p>
        </div>

        {/* 3 Key Checkpoints */}
        <div className="pt-2 space-y-2 border-t border-fimiku-lightBorder">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-fimiku-darkText">
            <Check className="w-4 h-4 text-fimiku-cta flex-shrink-0" />
            <span>100% Food-Grade Silicone</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-fimiku-darkText">
            <Check className="w-4 h-4 text-fimiku-cta flex-shrink-0" />
            <span>BPA-Free, PVC-Free & Non-toxic</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-fimiku-darkText">
            <Check className="w-4 h-4 text-fimiku-cta flex-shrink-0" />
            <span>Easy to Clean & Sterilize</span>
          </div>
        </div>
      </div>

      {/* 2. Commitment to Quality */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText text-center">
          Our Commitment to Quality
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-fimiku-secondaryText leading-relaxed">
          <p>
            Our collection includes a wide range of baby essentials such as teething toys, bath toys, feeding accessories, and sensory learning products. Each product is designed with both functionality and aesthetics in mind, offering a premium feel that modern parents trust and love. From soothing teething discomfort to making bath time fun and safe, Fimiku products are made to support every stage of early development.
          </p>
          <p>
            What sets Fimiku apart is our commitment to quality through complete control of the manufacturing process. We are not just a seller—we are manufacturers who ensure every product is crafted with precision and care. This allows us to maintain consistent quality, offer better value, and deliver products that meet the expectations of premium customers.
          </p>
          <p>
            Unlike plastic, silicone offers a safer and more sustainable alternative for baby products. It is non-toxic, heat-resistant, and does not release harmful chemicals, making it ideal for items that babies chew and interact with closely. By choosing silicone, parents can ensure a higher level of safety and long-term usability.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-fimiku-lightBorder">
          <div className="bg-fimiku-softLavender rounded-2xl p-5 text-center space-y-2 border border-fimiku-lightBorder">
            <div className="w-10 h-10 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText">Trusted by Parents</h3>
            <p className="text-[11px] text-fimiku-secondaryText leading-relaxed">
              Parents appreciate the softness, durability, and high-quality finish of our products.
            </p>
          </div>

          <div className="bg-fimiku-softLavender rounded-2xl p-5 text-center space-y-2 border border-fimiku-lightBorder">
            <div className="w-10 h-10 mx-auto rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText">Premium Manufacturing</h3>
            <p className="text-[11px] text-fimiku-secondaryText leading-relaxed">
              We control the entire process to ensure consistent quality, precision, and better value.
            </p>
          </div>

          <div className="bg-fimiku-softLavender rounded-2xl p-5 text-center space-y-2 border border-fimiku-lightBorder">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-fimiku-cta">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText">Dedicated Support</h3>
            <p className="text-[11px] text-fimiku-secondaryText leading-relaxed">
              For any inquiries, support, or bulk orders, we are always ready to assist you.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="px-8 py-3 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md inline-flex items-center gap-2"
          >
            Explore the Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
