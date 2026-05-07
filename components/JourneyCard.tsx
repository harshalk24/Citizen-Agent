"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface JourneyCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  benefits: string[];
  steps: number;
  duration: string;
  color: string;
  border: string;
  gradient: string;
}

export default function JourneyCard({
  id, icon: Icon, title, subtitle, benefits, steps, duration, color, border, gradient,
}: JourneyCardProps) {
  return (
    <Link href={`/journeys/${id}`} className="group block">
      <div className={`relative glass rounded-2xl border ${border} overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl`}>
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        <div className="relative z-10 p-8">
          {/* Icon + meta */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="w-3.5 h-3.5" />
                {duration}
              </div>
              <div className="text-xs text-white/40">{steps} steps</div>
            </div>
          </div>

          <h3 className="text-2xl font-700 mb-1">{title}</h3>
          <p className="text-white/50 text-sm mb-6">{subtitle}</p>

          {/* Benefits list */}
          <div className="space-y-2 mb-6">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-brand font-600 group-hover:gap-3 transition-all">
            Start Journey
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
