"use client";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Info,
  X,
  ExternalLink,
  Search,
  ChevronsUpDown,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type TokenColumn = "New pairs" | "Final Stretch" | "Migrated";
type SortDirection = "ascending" | "descending" | null;
type SortKey = "marketCap" | "price" | "volume24h" | "change24h";

interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string; // Emoji or image URL
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  column: TokenColumn;
  history: number[];
  liquidity: number;
  holders: number;
  transactions24h: number;
}

interface Particle {
  left: number;
  top: number;
  delay: number;
  duration: number;
}

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (num: number): string => {
  if (num === 0 || num === undefined || num === null) return "$0.00";
  if (num < 0.01) {
    return `$${num.toFixed(6)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num);
};

const generateSparklinePath = (history: number[]): string => {
  if (!history || history.length < 2) return "";
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = history.map((value, index) => {
    const x = (index / (history.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TOKENS: Token[] = [
  {
    id: "1",
    name: "NanoBanana",
    symbol: "NB",
    icon: "🍌",
    price: 0.85,
    change24h: 0.05,
    marketCap: 120000000,
    volume24h: 35000000,
    column: "New pairs",
    history: [0.8, 0.82, 0.85, 0.83, 0.85, 0.87, 0.85],
    liquidity: 5000000,
    holders: 12450,
    transactions24h: 8920,
  },
  {
    id: "2",
    name: "QuantumLeap",
    symbol: "QL",
    icon: "⚡",
    price: 1.52,
    change24h: -0.02,
    marketCap: 450000000,
    volume24h: 80000000,
    column: "Final Stretch",
    history: [1.55, 1.53, 1.52, 1.54, 1.52, 1.51, 1.52],
    liquidity: 15000000,
    holders: 28340,
    transactions24h: 15670,
  },
  {
    id: "3",
    name: "AxiomCore",
    symbol: "AXC",
    icon: "🔷",
    price: 12.1,
    change24h: 0.15,
    marketCap: 900000000,
    volume24h: 120000000,
    column: "New pairs",
    history: [12.0, 12.05, 12.1, 12.08, 12.1, 12.12, 12.1],
    liquidity: 25000000,
    holders: 45230,
    transactions24h: 22450,
  },
  {
    id: "4",
    name: "DigitalFlow",
    symbol: "DFL",
    icon: "💧",
    price: 0.012,
    change24h: -0.001,
    marketCap: 50000000,
    volume24h: 15000000,
    column: "Migrated",
    history: [0.013, 0.0125, 0.012, 0.0122, 0.012, 0.0118, 0.012],
    liquidity: 2000000,
    holders: 8920,
    transactions24h: 5430,
  },
  {
    id: "5",
    name: "HyperChain",
    symbol: "HCH",
    icon: "⛓️",
    price: 4.7,
    change24h: 0.35,
    marketCap: 300000000,
    volume24h: 65000000,
    column: "New pairs",
    history: [4.5, 4.6, 4.7, 4.65, 4.7, 4.72, 4.7],
    liquidity: 12000000,
    holders: 19870,
    transactions24h: 11290,
  },
  {
    id: "6",
    name: "MetaVerse",
    symbol: "MV",
    icon: "🌐",
    price: 2.34,
    change24h: 0.08,
    marketCap: 250000000,
    volume24h: 45000000,
    column: "Final Stretch",
    history: [2.3, 2.32, 2.34, 2.33, 2.34, 2.35, 2.34],
    liquidity: 8000000,
    holders: 16540,
    transactions24h: 9340,
  },
  {
    id: "7",
    name: "CryptoWave",
    symbol: "CW",
    icon: "🌊",
    price: 0.56,
    change24h: -0.03,
    marketCap: 80000000,
    volume24h: 22000000,
    column: "Migrated",
    history: [0.58, 0.57, 0.56, 0.57, 0.56, 0.55, 0.56],
    liquidity: 3500000,
    holders: 11230,
    transactions24h: 6780,
  },
  {
    id: "8",
    name: "BlockForce",
    symbol: "BF",
    icon: "🔷",
    price: 8.92,
    change24h: 0.22,
    marketCap: 520000000,
    volume24h: 95000000,
    column: "New pairs",
    history: [8.7, 8.8, 8.92, 8.88, 8.92, 8.95, 8.92],
    liquidity: 18000000,
    holders: 32450,
    transactions24h: 18920,
  },
];

// ============================================================================
// WEBSOCKET SIMULATION
// ============================================================================

const mockWebSocket = (
  initialTokens: Token[],
  onUpdate: (update: {
    id: string;
    price: number;
    change24h: number;
    history: number[];
  }) => void
) => {
  const intervalId = setInterval(() => {
    initialTokens.forEach((token) => {
      const priceChange = (Math.random() * 0.04 - 0.02) * token.price;
      const newPrice = Math.max(0.0001, token.price + priceChange);
      const newChange24h = Math.random() * 0.4 - 0.2;

      const newHistory = [...token.history.slice(1), newPrice];

      onUpdate({
        id: token.id,
        price: newPrice,
        change24h: newChange24h,
        history: newHistory,
      });
    });
  }, 3000);

  return () => clearInterval(intervalId);
};

// ============================================================================
// ATOM COMPONENTS
// ============================================================================

const Sparkline = memo(
  ({ path, color }: { path: string; color: "green" | "red" }) => (
    <svg viewBox="0 0 100 30" className="w-24 h-8">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d={path}
        className={color === "green" ? "text-green-400" : "text-red-400"}
      />
    </svg>
  )
);
Sparkline.displayName = "Sparkline";

const TokenBadge = memo(
  ({ children, type }: { children: React.ReactNode; type: TokenColumn }) => {
    const configs = {
      "New pairs": {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        border: "border-blue-500/30",
        icon: Clock,
      },
      "Final Stretch": {
        bg: "bg-amber-500/20",
        text: "text-amber-300",
        border: "border-amber-500/30",
        icon: TrendingUp,
      },
      Migrated: {
        bg: "bg-green-500/20",
        text: "text-green-300",
        border: "border-green-500/30",
        icon: CheckCircle,
      },
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} whitespace-nowrap`}
      >
        <Icon className="w-3 h-3 mr-1.5" />
        {children}
      </div>
    );
  }
);
TokenBadge.displayName = "TokenBadge";

const ChangeCell = memo(
  ({
    value,
    previousChange,
  }: {
    value: number;
    previousChange: number | null;
  }) => {
    const [flashClass, setFlashClass] = useState("");
    const isPositive = value >= 0;

    useEffect(() => {
      if (previousChange !== null && value !== previousChange) {
        const flash =
          value > previousChange ? "bg-green-500/20" : "bg-red-500/20";
        setFlashClass(flash);
        const timer = setTimeout(() => setFlashClass(""), 500);
        return () => clearTimeout(timer);
      }
    }, [value, previousChange]);

    return (
      <div
        className={`transition-all duration-500 rounded px-2 py-1 ${flashClass}`}
      >
        <span
          className={`font-semibold ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {(value * 100).toFixed(2)}%
        </span>
      </div>
    );
  }
);
ChangeCell.displayName = "ChangeCell";

const PriceCell = memo(
  ({
    price,
    previousPrice,
  }: {
    price: number;
    previousPrice: number | null;
  }) => {
    const [flashClass, setFlashClass] = useState("");

    useEffect(() => {
      if (previousPrice !== null && price !== previousPrice) {
        const flash =
          price > previousPrice ? "bg-green-500/20" : "bg-red-500/20";
        setFlashClass(flash);
        const timer = setTimeout(() => setFlashClass(""), 500);
        return () => clearTimeout(timer);
      }
    }, [price, previousPrice]);

    return (
      <div
        className={`transition-all duration-500 rounded px-2 py-1 ${flashClass}`}
      >
        <span className="font-semibold text-white">{formatCurrency(price)}</span>
      </div>
    );
  }
);
PriceCell.displayName = "PriceCell";

// ============================================================================
// DROPDOWN COMPONENT
// ============================================================================

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-5 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white hover:bg-gray-700/80 hover:border-blue-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[180px] justify-between shadow-lg hover:shadow-xl"
        aria-label={label}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-gray-300" />}
          <span className="font-semibold text-sm">
            {options.find((opt) => opt.value === value)?.label || label}
          </span>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[100] mt-2 w-full min-w-[180px] bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-all ${
                  value === option.value
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

const Tooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-[110] px-3 py-2 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-lg border border-gray-700 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-gray-800 border-l border-b border-gray-700 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// POPOVER COMPONENT
// ============================================================================

const Popover = ({ token }: { token: Token }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Show token details"
      >
        <Info className="w-4 h-4 text-gray-400 hover:text-blue-400" />
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setShow(false)} />
          <div className="absolute z-[110] w-64 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 -right-2 top-8">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white">Token Details</h3>
                <button
                  onClick={() => setShow(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Liquidity:</span>
                  <span className="font-medium text-white">
                    {formatCurrency(token.liquidity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Holders:</span>
                  <span className="font-medium text-white">
                    {formatNumber(token.holders)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Transactions:</span>
                  <span className="font-medium text-white">
                    {formatNumber(token.transactions24h)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

const Modal = ({
  tokenId,
  tokens,
  previousTokens,
  onClose,
}: {
  tokenId: string | null;
  tokens: Token[];
  previousTokens: Token[];
  onClose: () => void;
}) => {
  const token = tokenId ? tokens.find((t) => t.id === tokenId) : null;
  const previousToken = tokenId
    ? previousTokens.find((t) => t.id === tokenId) || null
    : null;

  if (!token) return null;

  const prevPrice = previousToken?.price ?? token.price;
  const prevChange = previousToken?.change24h ?? token.change24h;
  const [priceFlashClass, setPriceFlashClass] = useState("");
  const [changeFlashClass, setChangeFlashClass] = useState("");

  useEffect(() => {
    if (previousToken && token.price !== prevPrice) {
      const flash =
        token.price > prevPrice ? "bg-green-500/20" : "bg-red-500/20";
      setPriceFlashClass(flash);
      const timer = setTimeout(() => setPriceFlashClass(""), 500);
      return () => clearTimeout(timer);
    }
  }, [token.price, prevPrice, previousToken]);

  useEffect(() => {
    if (previousToken && token.change24h !== prevChange) {
      const flash =
        token.change24h > prevChange ? "bg-green-500/20" : "bg-red-500/20";
      setChangeFlashClass(flash);
      const timer = setTimeout(() => setChangeFlashClass(""), 500);
      return () => clearTimeout(timer);
    }
  }, [token.change24h, prevChange, previousToken]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600 overflow-hidden relative">
                {token.icon.startsWith("http") ||
                token.icon.startsWith("data:") ? (
                  <img
                    src={token.icon}
                    alt={token.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to symbol if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.textContent = token.symbol[0];
                        parent.className +=
                          " text-gray-300 text-2xl font-semibold";
                      }
                    }}
                  />
                ) : (
                  <span className="text-4xl leading-none">{token.icon}</span>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{token.name}</h2>
                <p className="text-gray-400 text-lg">{token.symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 bg-gray-900 rounded-lg border border-gray-700 transition-all duration-500 ${priceFlashClass}`}
            >
              <div className="text-sm text-gray-400 mb-1 font-medium">Price</div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(token.price)}
              </div>
              <div
                className={`text-sm font-semibold transition-all duration-500 ${changeFlashClass} ${
                  token.change24h >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {token.change24h >= 0 ? "+" : ""}
                {(token.change24h * 100).toFixed(2)}% (24h)
              </div>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1 font-medium">
                Market Cap
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(token.marketCap)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Volume (24h):</span>
                <span className="font-semibold text-white">
                  {formatCurrency(token.volume24h)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Liquidity:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(token.liquidity)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Holders:</span>
                <span className="font-semibold text-white">
                  {formatNumber(token.holders)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Transactions:</span>
                <span className="font-semibold text-white">
                  {formatNumber(token.transactions24h)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Status:</span>
                <TokenBadge type={token.column}>{token.column}</TokenBadge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="font-semibold text-white mb-4">
              Price History (7 days)
            </h3>
            <div className="h-24 flex items-end justify-between gap-1">
              {token.history.map((price, i) => {
                const maxPrice = Math.max(...token.history);
                const height = (price / maxPrice) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-end justify-center"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        token.change24h >= 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2">
            <span>View on Explorer</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOKEN ROW COMPONENT
// ============================================================================

const TokenRow = memo(
  ({
    token,
    previousToken,
    onClick,
  }: {
    token: Token;
    previousToken: Token | null;
    onClick: () => void;
  }) => {
    const sparklinePath = generateSparklinePath(token.history);
    const sparklineColor = token.change24h >= 0 ? "green" : "red";
    const prevPrice = previousToken?.price ?? token.price;
    const prevChange = previousToken?.change24h ?? token.change24h;

    return (
      <tr
        className="border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-800/30 transition-all duration-200 cursor-pointer group"
        onClick={onClick}
      >
        <td className="py-5 px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600/50 overflow-hidden relative group-hover:border-blue-500/50 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-200">
              {token.icon.startsWith('http') || token.icon.startsWith('data:') ? (
                <img 
                  src={token.icon} 
                  alt={token.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    // Fallback to symbol if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.textContent = token.symbol[0];
                      parent.className += ' text-gray-300 text-lg font-semibold';
                    }
                  }}
                />
              ) : (
                <span className="text-3xl leading-none group-hover:scale-110 transition-transform duration-200">{token.icon}</span>
              )}
            </div>
            <div>
              <div className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">{token.name}</div>
              <div className="text-sm text-gray-400 font-medium">{token.symbol}</div>
            </div>
          </div>
        </td>

        <td className="py-5 px-4 lg:px-6 hidden md:table-cell">
          <TokenBadge type={token.column}>{token.column}</TokenBadge>
        </td>

        <td className="py-5 px-4 lg:px-6 text-gray-200 font-semibold text-base hidden lg:table-cell group-hover:text-white transition-colors">
          {formatCurrency(token.marketCap)}
        </td>

        <td className="py-5 px-4 lg:px-6 text-gray-200 font-semibold text-base hidden xl:table-cell group-hover:text-white transition-colors">
          {formatCurrency(token.volume24h)}
        </td>

        <td className="py-5 px-4 lg:px-6 hidden sm:table-cell">
          <div className="group-hover:scale-105 transition-transform duration-200">
            <Sparkline path={sparklinePath} color={sparklineColor} />
          </div>
        </td>

        <td className="py-5 px-4 lg:px-6">
          <ChangeCell value={token.change24h} previousChange={prevChange} />
        </td>

        <td className="py-5 px-4 lg:px-6">
          <PriceCell price={token.price} previousPrice={prevPrice} />
        </td>

        <td className="py-5 px-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <Tooltip content="More information">
              <Popover token={token} />
            </Tooltip>
          </div>
        </td>
      </tr>
    );
  }
);
TokenRow.displayName = "TokenRow";

// ============================================================================
// SKELETON LOADER
// ============================================================================

const SkeletonRow = () => (
  <tr className="border-b border-gray-700 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="py-4 px-4 lg:px-6">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

// ============================================================================
// TABLE HEADER
// ============================================================================

const TableHeader = memo(
  ({
    sortKey,
    sortDirection,
    setSort,
  }: {
    sortKey: SortKey | null;
    sortDirection: SortDirection;
    setSort: (key: SortKey) => void;
  }) => {
    const headers = [
      { key: "name" as const, label: "Token", sortable: false },
      {
        key: "column" as const,
        label: "Status",
        sortable: false,
        className: "hidden md:table-cell",
      },
      {
        key: "marketCap" as const,
        label: "Market Cap",
        sortable: true,
        className: "hidden lg:table-cell",
      },
      {
        key: "volume24h" as const,
        label: "Volume (24h)",
        sortable: true,
        className: "hidden xl:table-cell",
      },
      {
        key: "history" as const,
        label: "Chart (7d)",
        sortable: false,
        className: "hidden sm:table-cell",
      },
      { key: "change24h" as const, label: "Change (24h)", sortable: true },
      { key: "price" as const, label: "Price", sortable: true },
      { key: "actions" as const, label: "Info", sortable: false },
    ];

    return (
      <thead>
        <tr className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-b-2 border-gray-700/50">
          {headers.map((header) => (
            <th
              key={header.key}
              onClick={() => header.sortable && setSort(header.key as SortKey)}
              className={`py-4 px-4 lg:px-6 text-left text-xs font-bold text-gray-200 uppercase tracking-widest ${
                header.sortable ? "cursor-pointer hover:bg-gray-800/50 transition-all duration-200 group" : ""
              } ${header.className || ""}`}
            >
              <div className="flex items-center space-x-2">
                <span className="group-hover:text-blue-400 transition-colors">{header.label}</span>
                {header.sortable &&
                  sortKey === header.key &&
                  (sortDirection === "ascending" ? (
                    <SortAsc className="w-4 h-4 text-blue-400 animate-pulse" />
                  ) : (
                    <SortDesc className="w-4 h-4 text-blue-400 animate-pulse" />
                  ))}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  }
);
TableHeader.displayName = "TableHeader";

// ============================================================================
// FLOATING ANIMATION STYLES
// ============================================================================

const FloatingStyles = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const styleId = "floating-animation-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
        25% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
        50% { transform: translateY(-40px) translateX(-10px); opacity: 0.2; }
        75% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
      }
      .animate-float {
        animation: float linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TokenTradingTable = () => {
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);
  const [previousTokens, setPreviousTokens] = useState<Token[]>(MOCK_TOKENS);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey | null;
    direction: SortDirection;
  }>({
    key: "marketCap",
    direction: "descending",
  });
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColumn, setFilterColumn] = useState<TokenColumn | "All">("All");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize particles on client-side only to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 20,
      }))
    );
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const handleUpdate = (update: {
      id: string;
      price: number;
      change24h: number;
      history: number[];
    }) => {
      setTokens((prevTokens) => {
        setPreviousTokens(prevTokens);
        return prevTokens.map((token) =>
          token.id === update.id
            ? {
                ...token,
                price: update.price,
                change24h: update.change24h,
                history: update.history,
              }
            : token
        );
      });
    };

    const cleanup = mockWebSocket(MOCK_TOKENS, handleUpdate);
    return cleanup;
  }, [isLoading]);

  const filteredAndSortedTokens = useMemo(() => {
    if (isLoading) return [];

    let result = [...tokens];

    if (searchQuery) {
      result = result.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterColumn !== "All") {
      result = result.filter((token) => token.column === filterColumn);
    }

    const { key, direction } = sortConfig;
    if (key && direction) {
      result.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (aValue < bValue) return direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tokens, sortConfig, isLoading, searchQuery, filterColumn]);

  const setSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "descending"
          ? "ascending"
          : "descending",
    }));
  }, []);

  return (
    <>
      <FloatingStyles />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-indigo-950 relative overflow-hidden">
        {/* Enhanced Background Layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Vibrant animated gradient orbs */}
          <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-to-tr from-purple-500/20 via-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "4s" }}></div>
          
          {/* Additional accent orbs */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
          
          {/* Enhanced Grid Pattern - Primary (animated) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:24px_24px] animate-grid"></div>
          
          {/* Grid Pattern - Secondary (larger with color) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf615_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf615_1px,transparent_1px)] bg-[size:96px_96px]"></div>
          
          {/* Radial gradient overlay with color */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-500/5 to-gray-900/80"></div>
          
          {/* Enhanced diagonal lines with gradient */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(59, 130, 246, 0.1) 2px, rgba(59, 130, 246, 0.1) 4px)'
          }}></div>
          
          {/* Corner accent gradients - enhanced */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-purple-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl"></div>
          
          {/* Enhanced floating particles with glow */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float animate-glow"
              style={{
                width: `${2 + (i % 4)}px`,
                height: `${2 + (i % 4)}px`,
                left: `${5 + i * 6}%`,
                top: `${10 + (i % 5) * 18}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 5)}s`,
                background: i % 3 === 0 
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.2), transparent)' 
                  : i % 3 === 1 
                  ? 'radial-gradient(circle, rgba(168, 85, 247, 0.6), rgba(168, 85, 247, 0.2), transparent)'
                  : 'radial-gradient(circle, rgba(236, 72, 153, 0.6), rgba(236, 72, 153, 0.2), transparent)',
                boxShadow: `0 0 ${6 + (i % 3) * 3}px ${i % 3 === 0 ? 'rgba(59, 130, 246, 0.6)' : i % 3 === 1 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(236, 72, 153, 0.6)'}`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
          
          {/* Connecting lines effect */}
          <svg className="absolute inset-0 w-full h-full opacity-10" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
              </linearGradient>
            </defs>
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={i}
                x1={`${10 + i * 20}%`}
                y1="0"
                x2={`${15 + i * 18}%`}
                y2="100%"
                stroke="url(#lineGradient)"
                strokeWidth="1"
                opacity="0.2"
                style={{
                  animation: `fadeInOut ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </svg>
          
          {/* Enhanced scan line effect with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/8 to-transparent h-full" style={{
            backgroundSize: '100% 300%',
            animation: 'scan 10s linear infinite',
          }}></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 6s ease-in-out infinite',
          }}></div>
        </div>

        {/* Container */}
        <div className="relative z-10 max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          {/* Enhanced Header */}
          <div className="mb-12 text-center sm:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-800/80 backdrop-blur-sm rounded-full border border-gray-700/50 shadow-lg mb-6">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-sm text-gray-200 font-semibold tracking-wide">Live Market Data</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-4 leading-tight">
              Token Trading Hub
            </h1>
            <p className="text-xl text-gray-300 font-light max-w-2xl">
              Real-time cryptocurrency market analytics & insights
            </p>
          </div>

          {/* Enhanced Stats Cards - Top Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 relative z-10">
            <div className="group bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Tokens</span>
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="text-5xl font-extrabold text-white mb-1">{tokens.length}</div>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2"></div>
            </div>
            <div className="group bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Market Cap</span>
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="text-5xl font-extrabold text-white mb-1">
                {formatCurrency(tokens.reduce((sum, t) => sum + t.marketCap, 0))}
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2"></div>
            </div>
            <div className="group bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">24h Volume</span>
                <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="text-5xl font-extrabold text-white mb-1">
                {formatCurrency(tokens.reduce((sum, t) => sum + t.volume24h, 0))}
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-2"></div>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="mb-10 space-y-6 relative z-10">
            {/* Enhanced Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors z-10" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full pl-14 pr-6 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-xl"
              />
            </div>

            {/* Enhanced Filter Controls Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative">
              {/* Dropdowns Section */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <Dropdown
                    label="Filter by Status"
                    icon={Filter}
                    value={filterColumn}
                    onChange={(value) => setFilterColumn(value as TokenColumn | "All")}
                    options={[
                      { value: "All", label: "All Statuses" },
                      { value: "New pairs", label: "New Pairs" },
                      { value: "Final Stretch", label: "Final Stretch" },
                      { value: "Migrated", label: "Migrated" },
                    ]}
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <Dropdown
                    label="Sort by"
                    icon={sortConfig.direction === "ascending" ? SortAsc : SortDesc}
                    value={sortConfig.key || "marketCap"}
                    onChange={(value) => setSort(value as SortKey)}
                    options={[
                      { value: "marketCap", label: "Market Cap" },
                      { value: "price", label: "Price" },
                      { value: "volume24h", label: "Volume (24h)" },
                      { value: "change24h", label: "Change (24h)" },
                    ]}
                  />
                </div>
              </div>

              {/* Enhanced Quick Filter Pills */}
              <div className="flex gap-3 flex-wrap items-center w-full lg:w-auto justify-start lg:justify-end">
                <span className="text-sm text-gray-400 font-semibold hidden sm:inline uppercase tracking-wide whitespace-nowrap">Quick Filter:</span>
                {(["All", "New pairs", "Final Stretch", "Migrated"] as const).map(
                  (col) => (
                    <button
                      key={col}
                      onClick={() => setFilterColumn(col)}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border backdrop-blur-sm whitespace-nowrap ${
                        filterColumn === col
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                          : "bg-gray-800/80 text-gray-300 border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 hover:text-white"
                      }`}
                    >
                      {col}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Table Container */}
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 relative z-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <TableHeader
                  sortKey={sortConfig.key}
                  sortDirection={sortConfig.direction}
                  setSort={setSort}
                />
                <tbody className="bg-transparent divide-y divide-white/5">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredAndSortedTokens.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-gray-400"
                      >
                        No tokens found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedTokens.map((token) => (
                      <TokenRow
                        key={token.id}
                        token={token}
                        previousToken={
                          previousTokens.find((t) => t.id === token.id) || null
                        }
                        onClick={() => setSelectedTokenId(token.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal */}
        <Modal
          tokenId={selectedTokenId}
          tokens={tokens}
          previousTokens={previousTokens}
          onClose={() => setSelectedTokenId(null)}
        />
      </div>
    </>
  );
};

export default TokenTradingTable;
