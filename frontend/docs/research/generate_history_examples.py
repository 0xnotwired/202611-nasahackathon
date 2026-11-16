"""Synthetic design examples; it neither reads nor calibrates NASA data.

Run with Python and matplotlib. It only writes CSV/PNG in this folder.
It does not modify the mocks, the application or the API contract.
"""

from pathlib import Path
from datetime import datetime, timedelta, timezone
import csv
import math


OUTPUT = Path(__file__).resolve().parent
PROFILES = {
    "ascending": ("Rise with oscillations", [38.4, 38.8, 39.1, 38.9, 39.5, 39.8, 40.1, 40.0, 40.6, 40.8, 41.1, 41.3, 41.5]),
    "small_variation": ("Variation around a reference", [38.4, 38.5, 38.2, 38.4, 38.6, 38.3, 38.4, 38.5, 38.3, 38.4, 38.2, 38.5, 38.4]),
    "descending": ("Decline with oscillations", [38.4, 38.1, 37.8, 37.9, 37.4, 37.0, 36.7, 36.9, 36.3, 36.0, 35.7, 35.8, 35.4]),
    "recovery": ("Decline and recovery", [38.4, 38.1, 37.7, 37.2, 36.8, 36.9, 37.0, 37.4, 37.9, 38.3, 38.8, 39.0, 39.1]),
    "missing_visits": ("Visits without a result", [38.4, 38.6, None, 38.9, 39.0, None, None, 39.4, 39.5, 39.6, 39.8, 39.9, 40.0]),
    "method_change": ("Change of method: break the comparison", [38.4, 38.8, 39.1, 38.9, 39.5, 39.8, 40.1, 44.5, 44.7, 44.9, 45.0, 45.2, 45.1]),
}


def date_at(index):
    month_index = 2025 * 12 + 10 + index
    year, month = divmod(month_index, 12)
    return datetime(year, month + 1, 15, 8, tzinfo=timezone.utc)


def records():
    rows = []
    for scenario, (_, values) in PROFILES.items():
        assert len(values) == 13
        for index, value in enumerate(values):
            assert value is None or (math.isfinite(value) and value > 0)
            method = "DEMO-B" if scenario == "method_change" and index >= 7 else "DEMO-A"
            rows.append({
                "scenario_id": scenario,
                "subject_id": f"synthetic-{scenario}",
                "evaluation_id": f"{scenario}-{index:02d}",
                "recorded_at": date_at(index).isoformat().replace("+00:00", "Z"),
                "metric": "vo2_peak_demo",
                "value": "" if value is None else value,
                "unit": "mL/kg/min",
                "method": method,
                "measurement_kind": "simulated_measurement",
                "state": "not_recorded" if value is None else "recorded",
                "origin": "synthetic",
                "source": "hand_authored_design_example_v1",
                "clinical_validation": "pending",
            })
    assert len(rows) == 78
    assert len({row["evaluation_id"] for row in rows}) == len(rows)
    assert sum(row["value"] == "" for row in rows) == 3
    return rows


def write_csv(rows):
    target = OUTPUT / "aerobic-history-scenarios.csv"
    with target.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"CSV: {len(rows)} synthetic rows; 3 missing values.")


def plot(rows):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates

    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})
    fig, axes = plt.subplots(3, 2, figsize=(13, 10), sharex=True, sharey=True)
    fig.patch.set_facecolor("#f3f6fa")
    for ax, (scenario, (title, _)) in zip(axes.flat, PROFILES.items()):
        subset = [row for row in rows if row["scenario_id"] == scenario]
        dates = [datetime.fromisoformat(row["recorded_at"].replace("Z", "+00:00")) for row in subset]
        for method, color, marker in [("DEMO-A", "#246baf", "o"), ("DEMO-B", "#b26320", "s")]:
            values = [float(row["value"]) if row["value"] != "" and row["method"] == method else float("nan") for row in subset]
            if any(math.isfinite(value) for value in values):
                ax.plot(dates, values, color=color, marker=marker, linestyle="--", linewidth=1.4, markersize=4, label=method)
        if scenario == "method_change":
            ax.hlines(38.4, dates[0], dates[6], color="#63768b", linewidth=0.8, linestyle=":")
        else:
            ax.axhline(38.4, color="#63768b", linewidth=0.8, linestyle=":")
        if scenario == "method_change":
            ax.axvline(dates[7], color="#63768b", linewidth=0.9, linestyle=":")
            ax.text(dates[7], 34.6, "New method", fontsize=9, rotation=90, va="bottom", ha="right", color="#52677d")
        if scenario == "missing_visits":
            for date, row in zip(dates, subset):
                if row["value"] == "":
                    ax.axvspan(date - timedelta(days=4), date + timedelta(days=4), color="#dce4ed", alpha=0.7)
            ax.text(0.02, 0.81, "Gray bands: visits without a result", transform=ax.transAxes, fontsize=9, color="#52677d")
        ax.set_title(title, loc="left", fontsize=11, fontweight="bold", color="#142d49", pad=12)
        ax.set_ylim(34, 47)
        ax.grid(axis="y", color="#dce4ed", linewidth=0.7)
        ax.spines[["top", "right"]].set_visible(False)
        ax.spines[["left", "bottom"]].set_color("#dce4ed")
        ax.tick_params(colors="#52677d", labelbottom=True, labelleft=True)
        ax.set_xticks([dates[index] for index in [0, 3, 6, 9, 12]])
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%m/%Y"))
        ax.set_ylabel("mL/kg/min · demo unit", fontsize=9)
        ax.legend(loc="upper left", frameon=False, fontsize=8, ncol=2)
    fig.suptitle("Design histories for Órbita · entirely fictional data", fontsize=17, fontweight="bold", color="#142d49", y=0.98)
    fig.text(0.5, 0.025, "13 nominal visits: Nov 2025–Nov 2026. Dots = observations; lines = visual guide.\nDotted reference = first fictional value, not normality. They are neither NASA data nor response models.", ha="center", fontsize=10, color="#52677d")
    fig.tight_layout(rect=(0, 0.07, 1, 0.95), h_pad=2.6, w_pad=2.1)
    fig.savefig(OUTPUT / "aerobic-history-scenarios.png", dpi=160, facecolor=fig.get_facecolor())
    plt.close(fig)
    print("Figure generated: six scenarios, common scale and gaps kept.")


if __name__ == "__main__":
    sample = records()
    write_csv(sample)
    plot(sample)
