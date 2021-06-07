{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" -}}
{{- $appName := include "generic-service.name" . -}}
env:
{{- range $secret, $envs := .Values.namespace_secrets }}
  {{- range $key, $val := $envs }}
  - name: {{ $key }}
    valueFrom:
      secretKeyRef:
        key: {{ $val }}
        name: {{ $secret }}
  {{- end }}
{{- end }}
{{- range $key, $val := .Values.env }}
  - name: {{ $key }}
    value: "{{ $val }}"
{{- end }}
{{- end }}
