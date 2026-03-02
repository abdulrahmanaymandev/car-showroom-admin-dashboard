import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import { searchCars, getCarDetails } from "../../api/mockCarsApi";
import "./CarSpecificationsPage.css";
import { SearchIcon, SpinnerIcon, ErrorIcon } from "../../components/Icons";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";

export default function CarSpecificationsPage() {
    const { lang } = useLanguage();
    const t = translations[lang];

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 350);

    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);

    const [selected, setSelected] = useState(null); // {id, make, model}
    const [details, setDetails] = useState(null);

    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [errorSuggest, setErrorSuggest] = useState(null);

    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);

    // ✅ Autocomplete (Mock API)
    useEffect(() => {
        let alive = true;

        const run = async () => {
            const q = debouncedQuery.trim();
            if (q.length < 2) {
                setSuggestions([]);
                setOpen(false);
                setErrorSuggest(null);
                return;
            }

            try {
                setLoadingSuggest(true);
                setErrorSuggest(null);
                setOpen(true);

                const list = await searchCars(q);
                if (!alive) return;

                setSuggestions(list);
            } catch (e) {
                if (!alive) return;
                setSuggestions([]);
                setErrorSuggest(e.message || "Failed to fetch suggestions");
            } finally {
                if (alive) setLoadingSuggest(false);
            }
        };

        run();
        return () => {
            alive = false;
        };
    }, [debouncedQuery]);

    const onSelect = async (item) => {
        setSelected({ id: item.id, make: item.make, model: item.model });
        setQuery(`${item.make} ${item.model}`);
        setOpen(false);

        try {
            setLoadingDetails(true);
            setErrorDetails(null);
            setDetails(null);

            const full = await getCarDetails(item.id);
            setDetails(full);
        } catch (e) {
            setErrorDetails(e.message || "Failed to fetch details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const clearAll = () => {
        setQuery("");
        setSuggestions([]);
        setOpen(false);
        setSelected(null);
        setDetails(null);
        setErrorSuggest(null);
        setErrorDetails(null);
    };

    return (
        <div>
            <h2>{t.carSpecsTitle}</h2>

            {/* ✅ نفس فكرة input + clear (صف واحد) */}
            <div className="cs-toolbar">
                <div className="cs-inputWrap">
                    <input
                        className="cs-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.typeToSearch}
                        onFocus={() => suggestions.length && setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 120)}
                    />
                </div>

                <button className="cs-clear" onClick={clearAll}>
                    {t.clear}
                </button>

                {/* Suggestions dropdown */}
                {open && (
                    <div className="cs-suggestBox">
                        {loadingSuggest ? (
                            <div className="cs-suggestMsg">{t.loading}</div>
                        ) : errorSuggest ? (
                            <div className="cs-suggestErr">{errorSuggest}</div>
                        ) : suggestions.length === 0 ? (
                            <div className="cs-suggestMsg">{t.noSuggestions}</div>
                        ) : (
                            suggestions.map((s) => (
                                <button
                                    key={s.id}
                                    className="cs-suggestItem"
                                    onMouseDown={() => onSelect(s)}
                                >
                                    <b>{String(s.make).toUpperCase()}</b> — {s.model}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Empty state */}
            {!selected && query.trim().length < 2 && (
                <EmptyState
                    icon={<SearchIcon size={64} />}
                    title={t.carSpecsTitle}
                    message={t.startTypingMsg}
                />
            )}

            {/* Selected + Details */}
            {selected && (
                <div style={{ marginTop: 16 }}>
                    <h3>
                        {t.selectedCar}: {selected.make} {selected.model}
                    </h3>

                    {loadingDetails && (
                        <EmptyState icon={<SpinnerIcon size={48} />} title={t.loading} message={t.loading} />
                    )}
                    {errorDetails && <EmptyState icon={<ErrorIcon size={48} />} title={t.error} message={errorDetails} />}

                    {details && (
                        <div className="cs-detailsGrid">
                            <Info label={t.make} value={details.make} />
                            <Info label={t.model} value={details.model} />
                            <Info label={t.year} value={details.year} />
                            <Info label={t.class} value={details.class} />
                            <Info label={t.fuel} value={details.fuel_type} />
                            <Info label={t.transmission} value={details.transmission} />
                            <Info label={t.drive} value={details.drive} />
                            <Info label={t.cylinders} value={details.cylinders} />
                            <Info label={t.displacement} value={details.displacement} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="cs-infoCard">
            <div className="cs-infoLabel">{label}</div>
            <div className="cs-infoValue">{String(value ?? "-")}</div>
        </div>
    );
}

function useDebounce(value, delay) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}
