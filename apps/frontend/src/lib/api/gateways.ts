import { apiClient } from './client'
import type {
  GatewayListItem,
  GatewayDetail,
  ConnectionResult,
  Capability,
  GatewayHealthData,
  StoreGatewayPayload,
  UpdateGatewayPayload,
} from '@/types/gateway'

export async function fetchGateways(): Promise<GatewayListItem[]> {
  const response = await apiClient<GatewayListItem[]>('/api/v1/dashboard/gateways')
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function fetchGateway(uuid: string): Promise<GatewayDetail> {
  const response = await apiClient<GatewayDetail>(`/api/v1/dashboard/gateways/${uuid}`)
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function createGateway(payload: StoreGatewayPayload) {
  const response = await apiClient('/api/v1/dashboard/gateways', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function updateGateway(uuid: string, payload: UpdateGatewayPayload) {
  const response = await apiClient(`/api/v1/dashboard/gateways/${uuid}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function deleteGateway(uuid: string) {
  const response = await apiClient(`/api/v1/dashboard/gateways/${uuid}`, {
    method: 'DELETE',
  })
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function testGatewayConnection(uuid: string): Promise<ConnectionResult> {
  const response = await apiClient<ConnectionResult>(`/api/v1/dashboard/gateways/${uuid}/test`, {
    method: 'POST',
  })
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function fetchGatewayHealth(uuid: string): Promise<GatewayHealthData> {
  const response = await apiClient<GatewayHealthData>(`/api/v1/dashboard/gateways/${uuid}/health`)
  if (!response.success) throw new Error(response.error.message)
  return response.data
}

export async function fetchCapabilities(): Promise<Record<string, Capability>> {
  const response = await apiClient<Record<string, Capability>>('/api/v1/dashboard/gateways/capabilities')
  if (!response.success) throw new Error(response.error.message)
  return response.data
}
