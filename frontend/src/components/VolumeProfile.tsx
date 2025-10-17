"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileItem {
  preco_min: number;
  preco_max: number;
  volume: number;
}

interface VolumeProfileData {
  profile: ProfileItem[];
  poc: number;
  volume_total: number;
}

interface Props {
  ticker: string;
}

export default function VolumeProfile({ ticker }: Props) {
  const [data, setData] = useState<VolumeProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolumeProfile();
  }, [ticker]);

  const fetchVolumeProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/b3/analise/volume-profile/${ticker}?periodo=3mo`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao buscar volume profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxVolume = Math.max(...data.profile.map(p => p.volume));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Volume Profile</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">POC (Point of Control)</p>
          <p className="text-lg font-bold text-blue-400">R$ {data.poc.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-1">
        {data.profile.map((item, idx) => {
          const widthPercent = (item.volume / maxVolume) * 100;
          const precoMedio = (item.preco_min + item.preco_max) / 2;
          const isPOC = Math.abs(precoMedio - data.poc) < 0.5;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="flex items-center gap-2"
            >
              <div className="w-20 text-right">
                <span className="text-xs text-gray-400">
                  R$ {precoMedio.toFixed(2)}
                </span>
              </div>
              <div className="flex-1 relative h-6">
                <div
                  className={`h-full rounded transition-all ${
                    isPOC
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-800"
                      : "bg-gradient-to-r from-blue-600 to-blue-800"
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />
                {isPOC && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                    POC
                  </span>
                )}
              </div>
              <div className="w-24 text-left">
                <span className="text-xs text-gray-500">
                  {(item.volume / 1e6).toFixed(1)}M
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400">Volume Total</p>
          <p className="text-lg font-bold text-white">
            {(data.volume_total / 1e6).toFixed(1)}M
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">POC</p>
          <p className="text-lg font-bold text-yellow-400">
            R$ {data.poc.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Faixas</p>
          <p className="text-lg font-bold text-white">{data.profile.length}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
        <p className="text-xs text-gray-300">
          💡 <strong>POC (Point of Control)</strong> é o preço com maior volume negociado.
          Funciona como forte suporte/resistência.
        </p>
      </div>
    </motion.div>
  );
}

