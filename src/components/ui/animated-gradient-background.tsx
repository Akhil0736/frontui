"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const AnimatedGradientBackground = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-[#121212]",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="jumbo absolute -inset-[10px] opacity-50"></div>
      </div>
      {children}
    </div>
  );
};
