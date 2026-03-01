import { useEffect, useMemo, useState } from "react";

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337";

export default function CoinPriceWidget({
  coinGeckoId,
  coinSymbol,
  apiBase = DEFAULT_API_BASE,
}) {
  const [price, setPrice] = useState(null);
  const [coinAmount, setCoinAmount] = useState("1");
  const [usdAmount, setUsdAmount] = useState("");
  const [isCoinPrimary, setIsCoinPrimary] = useState(true);
  const [loading, setLoading] = useState(false);

  const displaySymbol = useMemo(() => {
    if (coinSymbol && typeof coinSymbol === "string" && coinSymbol.trim()) {
      return coinSymbol.trim().toUpperCase();
    }
    if (coinGeckoId && typeof coinGeckoId === "string") {
      return coinGeckoId.trim().toUpperCase();
    }
    return "COIN";
  }, [coinGeckoId, coinSymbol]);

  useEffect(() => {
    if (!coinGeckoId) {
      return;
    }

    const controller = new AbortController();

    async function loadPrice() {
      setLoading(true);

      try {
        const response = await fetch(
          `${apiBase.replace(/\/$/, "")}/api/price?coinId=${encodeURIComponent(
            coinGeckoId
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setPrice(null);
          return;
        }

        const data = await response.json().catch(() => null);
        if (data && typeof data.usd === "number") {
          setPrice(data.usd);
          setCoinAmount("1");
          setUsdAmount(formatNumberForInput(data.usd, 6));
        } else {
          setPrice(null);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setPrice(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPrice();

    return () => {
      controller.abort();
    };
  }, [apiBase, coinGeckoId]);

  if (!coinGeckoId) {
    return null;
  }

  // Не показывать блок, пока идёт загрузка или нет данных по цене от CoinGecko
  if (loading || price === null) {
    return null;
  }

  const applyCoinChange = (value) => {
    setCoinAmount(value);

    const numericValue = parseNumber(value);
    if (price && numericValue !== null) {
      setUsdAmount(formatNumberForInput(numericValue * price, 6));
    } else {
      setUsdAmount("");
    }
  };

  const applyUsdChange = (value) => {
    setUsdAmount(value);

    const numericValue = parseNumber(value);
    if (price && price !== 0 && numericValue !== null) {
      setCoinAmount(formatNumberForInput(numericValue / price, 8));
    } else {
      setCoinAmount("");
    }
  };

  const handleSwap = () => {
    setIsCoinPrimary((prev) => !prev);
  };

  const leftCurrency = isCoinPrimary
    ? { type: "coin", symbol: displaySymbol, label: "Отдаете" }
    : { type: "usd", symbol: "USD", label: "Отдаете" };
  const rightCurrency = isCoinPrimary
    ? { type: "usd", symbol: "USD", label: "Получаете" }
    : { type: "coin", symbol: displaySymbol, label: "Получаете" };

  const leftValue =
    leftCurrency.type === "coin" ? coinAmount : usdAmount;
  const rightValue =
    rightCurrency.type === "coin" ? coinAmount : usdAmount;

  const onLeftChange = (event) => {
    const { value } = event.target;
    if (leftCurrency.type === "coin") {
      applyCoinChange(value);
    } else {
      applyUsdChange(value);
    }
  };

  const onRightChange = (event) => {
    const { value } = event.target;
    if (rightCurrency.type === "coin") {
      applyCoinChange(value);
    } else {
      applyUsdChange(value);
    }
  };

  return (
    <div className="coin-price-widget" aria-live="polite">
      <div className="coin-price-widget__rate">
        1 {displaySymbol} = ${formatNumber(price, 6)}
      </div>
      <div className="coin-price-widget__cards">
          <div className="coin-price-widget__column">
            <div className="coin-price-widget__label">{leftCurrency.label}</div>
            <div className="coin-price-widget__card">
              <div className="coin-price-widget__currency">
                {leftCurrency.symbol}
              </div>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                className="coin-price-widget__input"
                value={leftValue}
                onChange={onLeftChange}
                disabled={loading || price === null}
                aria-label={`Сумма в ${leftCurrency.symbol}`}
              />
            </div>
          </div>

          <button
            type="button"
            className="coin-price-widget__swap"
            onClick={handleSwap}
            aria-label="Поменять направление конвертации"
          >
            Поменять <span aria-hidden="true">⇆</span>
          </button>

          <div className="coin-price-widget__column">
            <div className="coin-price-widget__label">
              {rightCurrency.label}
            </div>
            <div className="coin-price-widget__card">
              <div className="coin-price-widget__currency">
                {rightCurrency.symbol}
              </div>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                className="coin-price-widget__input"
                value={rightValue}
                onChange={onRightChange}
                disabled={loading || price === null}
                aria-label={`Сумма в ${rightCurrency.symbol}`}
              />
            </div>
          </div>
        </div>

      <style jsx>{`
        @keyframes coin-price-widget-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .coin-price-widget {
          margin: 16px auto;
          padding: 18px 20px 22px;
          border: 1px solid #d8dbe7;
          border-radius: 16px;
          background: var(--mainbrand-white);
          font-family: inherit;
          color: var(--mainbrand-black);
          box-shadow: 0 6px 18px rgba(17, 24, 39, 0.08);
          animation: coin-price-widget-enter 0.5s ease-out forwards;
        }

        .coin-price-widget__rate {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 18px;
          color: #131a29;
        }

        .coin-price-widget__cards {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
        }

        .coin-price-widget__column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .coin-price-widget__label {
          font-size: 13px;
          color: #606a7f;
        }

        .coin-price-widget__card {
          border-radius: 12px;
          border: 1px solid #d8dbe7;
          overflow: hidden;
          background: #fdf3df;
          display: flex;
          flex-direction: column;
        }

        .coin-price-widget__currency {
          background:linear-gradient(180deg, #64c9bd 0%, #77d1c6 90%);
          color: #fff;
          padding: 10px 16px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .coin-price-widget__input {
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          background: #fff;
          font-size: 18px;
          font-weight: 600;
          color: #0b1627;
          border-radius: 0 0 12px 12px;
        }

        .coin-price-widget__input:disabled {
          background: #f1f3f7;
          color: #8c96a3;
        }

        .coin-price-widget__swap {
          border: none;
          background: transparent;
          color: #60b7ad;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .coin-price-widget__swap span {
          font-size: 20px;
        }

        .coin-price-widget__error {
          padding: 14px 16px;
          border: 1px solid #f5c0c0;
          background: #fdeeee;
          border-radius: 12px;
          color: #c0392b;
          font-weight: 600;
          text-align: center;
        }

        @media (max-width: 640px) {
          .coin-price-widget {
            padding: 16px;
          }

          .coin-price-widget__cards {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .coin-price-widget__swap {
            order: -1;
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

function parseNumber(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value, maxFractionDigits = 6) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

// Форматирование числа для input (без запятых, только точка для десятичных)
function formatNumberForInput(value, maxFractionDigits = 6) {
  if (!Number.isFinite(value)) {
    return "";
  }

  // Используем toFixed для контроля десятичных знаков, затем убираем лишние нули
  const fixed = value.toFixed(maxFractionDigits);
  // Убираем лишние нули в конце
  return fixed.replace(/\.?0+$/, "") || "0";
}

