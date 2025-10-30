"use client";

import { Clock } from "lucide-react";
import { ContractUtils } from "@/lib/contract-utils";

interface LifeTimerProps {
  timeRemaining: number;
}

export function LifeTimer({ timeRemaining }: LifeTimerProps) {

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-white">Time left to claim daily LIFE</p>
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Clock className="w-6 h-6 text-green-500" />
        <span className="text-white">{ContractUtils.formatTimeRemaining(timeRemaining)}</span>
      </div>
    </div>
  );
}
