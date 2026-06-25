// Instance types
export interface Instance {
  id: number
  instance_id: string
  region: string
  instance_type?: string
  ipv4?: string
  ipv6?: string
  domain?: string
  is_active: boolean
  creation_datetime: string
}

export interface CreateInstanceRequest {
  region: string
  city: string
  instance_type: string
}

// Subscription types
export interface Subscription {
  id: number
  subscription_id: string
  user_email: string
  instance_id: number
  expiry_date: string
  data_limit_gb: number
  data_used_gb: number
  status: string
  created_at: string
  updated_at: string
}

// Client Configuration types
export interface ClientConfiguration {
  id: number
  subscription_id: number
  xray_client_id: string
  inbound_id: number
  protocol: string
  config_json: string
  connection_string: string
  created_at: string
  updated_at: string
}

// API Error types
export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

// Health check types
export interface HealthStatus {
  status: string
  database?: string
  aws?: string
}

// AWS Setting types
export interface AwsSetting {
  id: number
  region: string
  ami_id: string
  city: string
}
