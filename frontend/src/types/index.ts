// Instance types
export interface Instance {
  id: number
  instance_id: string
  region: string
  instance_type?: string
  ipv4?: string
  ipv6?: string
  domain?: string
  webbase?: string
  is_active: boolean
  creation_datetime: string
}

export interface CreateInstanceRequest {
  region: string
  city: string
  instance_type: string
  domain?: string
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

// Domain types
export interface Domain {
  id: number
  root_domain: string
  is_active: boolean
}

export interface CreateDomainRequest {
  root_domain: string
  is_active?: boolean
}

export interface UpdateDomainRequest {
  root_domain?: string
  is_active?: boolean
}

// Plan types
export interface Plan {
  id: number
  name: string
  description?: string
  is_active: boolean
  month_price?: number
  bandwidth?: number
  connection?: number
}

export interface CreatePlanRequest {
  name: string
  description?: string
  is_active?: boolean
  month_price?: number
  bandwidth?: number
  connection?: number
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  is_active?: boolean
  month_price?: number
  bandwidth?: number
  connection?: number
}

// Node types
export interface Node {
  id: number
  server_id: number
  group_ids?: number[]  // Array of group IDs this node belongs to (many-to-many)
  remark?: string
  port?: number
  protocol?: string
  short_id?: string
  target?: string
  security?: string
  fingerprint?: string
  sni?: string
  inbound_id?: number
  is_active: boolean
  create_datetime?: string
}

// Group types
export interface Group {
  id: number
  name: string
  description?: string
  is_active: boolean
  plan_id?: number
}

export interface GroupWithNodes extends Group {
  nodes: Node[]
}

export interface CreateGroupRequest {
  name: string
  description?: string
  is_active?: boolean
  plan_id?: number
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  is_active?: boolean
  plan_id?: number
}

export interface AssignNodesRequest {
  node_ids: number[]
}

// Client types
export interface Client {
  id: number
  name: string
  OS: string
  download_url?: string
  sub_template?: string
  is_active: boolean
}

export interface CreateClientRequest {
  name: string
  OS: string
  download_url?: string
  sub_template?: string
  is_active?: boolean
}

export interface UpdateClientRequest {
  name?: string
  OS?: string
  download_url?: string
  sub_template?: string
  is_active?: boolean
}

// Subscription types
export interface SubscribePlanRequest {
  plan_id: number
  expiry_days?: number
}

export interface SubscribePlanResponse {
  message: string
  user_uuid: string
  plan_id: number
  group_id: number
  nodes_count: number
}

// User Management types
export interface User {
  id: number
  user_name: string
  email: string
  uuid: string | null
  role?: string
  is_active: boolean
  create_datetime: string
}

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  page_size: number
  total_pages: number
}