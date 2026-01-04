output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Resource group name"
}

output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.main.name
  description = "AKS cluster name"
}

output "aks_cluster_id" {
  value       = azurerm_kubernetes_cluster.main.id
  description = "AKS cluster ID"
}

output "acr_login_server" {
  value       = azurerm_container_registry.main.login_server
  description = "ACR login server"
}

output "kube_config" {
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
  description = "Kubernetes config"
}

output "client_certificate" {
  value     = azurerm_kubernetes_cluster.main.kube_config[0].client_certificate
  sensitive = true
}

output "cluster_endpoint" {
  value       = azurerm_kubernetes_cluster.main.kube_config[0].host
  sensitive   = true
  description = "Kubernetes API endpoint"
}
