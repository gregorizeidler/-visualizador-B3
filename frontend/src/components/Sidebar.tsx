"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Activity,
  GitCompare,
  Settings,
  Layers
} from "lucide-react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { id: "analise", label: "Análise Técnica", icon: TrendingUp },
  { id: "ranking", label: "Rankings", icon: BarChart3 },
  { id: "setores", label: "Setores", icon: Layers },
  { id: "comparacao", label: "Comparação", icon: GitCompare },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: Props) {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 glass border-r border-gray-800 p-6 z-50">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-bold text-white">B3 Viewer</h2>
        </div>
        <p className="text-xs text-gray-400">Análise Avançada de Ações</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Dados em tempo real</span>
          </div>
          <p className="text-xs text-gray-500">
            Atualizado via API B3
          </p>
        </div>
      </div>
    </div>
  );
}
