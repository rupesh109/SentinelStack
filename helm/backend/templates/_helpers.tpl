{{- define "sentinelstack-backend.name" -}}
sentinelstack-backend
{{- end }}

{{- define "sentinelstack-backend.fullname" -}}
{{ include "sentinelstack-backend.name" . }}
{{- end }}

{{- define "sentinelstack-backend.labels" -}}
app.kubernetes.io/name: {{ include "sentinelstack-backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "sentinelstack-backend.selectorLabels" -}}
app: backend
{{- end }}
