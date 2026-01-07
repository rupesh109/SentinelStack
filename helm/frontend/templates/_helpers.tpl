{{/*
Expand the name of the chart.
*/}}
{{- define "sentinelstack-frontend.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "sentinelstack-frontend.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "sentinelstack-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "sentinelstack-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "sentinelstack-frontend.labels" -}}
{{ include "sentinelstack-frontend.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
