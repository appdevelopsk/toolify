#!/opt/anaconda3/bin/python3
"""Pull GSC + GA4 metrics for toolify365.com and save a dated snapshot.

Runs locally (needs this machine's gcloud ADC + the GA4 service-account key),
so it CANNOT run as a remote Claude /schedule agent — driven by a local
launchd job instead (~/Library/LaunchAgents/com.toolify.metrics.plist).

Output: scripts/metrics-output/metrics-YYYY-MM-DD.json  +  one summary line in
scripts/metrics-output/summary.log
"""
import json, os, subprocess, urllib.request, urllib.error, urllib.parse, datetime

GCLOUD = "/opt/homebrew/bin/gcloud"
QUOTA_PROJECT = "pickly-496207"
GSC_SITE = "https://toolify365.com/"
GA4_KEY = "/Users/ken/Downloads/food-roulette-sk-33ec9b039d54.json"
GA4_PROPERTIES = ["534395895", "538597795"]
OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "metrics-output")

TODAY = datetime.date.today()
END = TODAY - datetime.timedelta(days=1)          # GSC/GA4 have ~2-3d lag; query through yesterday
START = END - datetime.timedelta(days=27)          # 28-day window


def _post(url, token, body, extra_headers=None):
    headers = {"Authorization": "Bearer " + token, "Content-Type": "application/json"}
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
    return json.load(urllib.request.urlopen(req, timeout=60))


def gsc_token():
    return subprocess.check_output(
        [GCLOUD, "auth", "application-default", "print-access-token"],
        text=True, stderr=subprocess.DEVNULL).strip()


def pull_gsc():
    token = gsc_token()
    site = urllib.parse.quote(GSC_SITE, safe="")
    url = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query"
    hdr = {"x-goog-user-project": QUOTA_PROJECT}
    out = {}
    for dim in (["date"], ["page"], ["query"]):
        body = {"startDate": START.isoformat(), "endDate": END.isoformat(),
                "dimensions": dim, "rowLimit": 1000}
        try:
            out["+".join(dim)] = _post(url, token, body, hdr).get("rows", [])
        except urllib.error.HTTPError as e:
            out["+".join(dim)] = {"error": e.read().decode()[:300]}
    return out


def pull_ga4():
    from google.oauth2 import service_account
    import google.auth.transport.requests as tr
    creds = service_account.Credentials.from_service_account_file(
        GA4_KEY, scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    creds.refresh(tr.Request())
    token = creds.token
    out = {}
    for pid in GA4_PROPERTIES:
        url = f"https://analyticsdata.googleapis.com/v1beta/properties/{pid}:runReport"
        body = {"dateRanges": [{"startDate": START.isoformat(), "endDate": END.isoformat()}],
                "dimensions": [{"name": "date"}],
                "metrics": [{"name": "activeUsers"}, {"name": "newUsers"}, {"name": "sessions"}],
                "orderBys": [{"dimension": {"dimensionName": "date"}}]}
        try:
            out[pid] = _post(url, token, body).get("rows", [])
        except Exception as e:  # noqa
            out[pid] = {"error": str(e)[:300]}
    return out


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    snap = {"pulledAt": TODAY.isoformat(), "window": {"start": START.isoformat(), "end": END.isoformat()}}
    try:
        snap["gsc"] = pull_gsc()
    except Exception as e:  # noqa
        snap["gsc"] = {"error": repr(e)[:300]}
    try:
        snap["ga4"] = pull_ga4()
    except Exception as e:  # noqa
        snap["ga4"] = {"error": repr(e)[:300]}

    path = os.path.join(OUTDIR, f"metrics-{TODAY.isoformat()}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(snap, f, ensure_ascii=False, indent=1)

    # one-line summary
    g = snap.get("gsc", {})
    rows = g.get("date", []) if isinstance(g, dict) else []
    clicks = sum(r.get("clicks", 0) for r in rows) if isinstance(rows, list) else 0
    impr = sum(r.get("impressions", 0) for r in rows) if isinstance(rows, list) else 0
    ga = snap.get("ga4", {})
    au = 0
    if isinstance(ga, dict):
        for pid, rws in ga.items():
            if isinstance(rws, list):
                for r in rws:
                    try:
                        au += int(r["metricValues"][0]["value"])
                    except Exception:  # noqa
                        pass
    line = (f"{TODAY.isoformat()}  GSC(28d): clicks={clicks:.0f} impr={impr:.0f} | "
            f"GA4(28d) activeUsers~{au}  -> {os.path.basename(path)}\n")
    with open(os.path.join(OUTDIR, "summary.log"), "a", encoding="utf-8") as f:
        f.write(line)
    print(line, end="")


if __name__ == "__main__":
    main()
