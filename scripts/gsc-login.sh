#!/bin/bash
# Re-auth ADC with Search Console read scope.
# NOTE: analytics.readonly is BLOCKED for gcloud's default client by Google (2026).
# GA4 must be queried via a service account with the GA4 property granting it access.
set -x
gcloud auth application-default login --scopes=openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly
