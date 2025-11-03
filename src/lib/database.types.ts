export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          company_name: string
          contact_person: string
          phone: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          contact_person: string
          phone: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string
          phone?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          listing_type: 'offer' | 'request'
          title: string
          description: string
          departure_city_china: string
          arrival_city_algeria: string
          port_loading: string
          port_arrival: string
          spots_count: number
          car_types: string
          estimated_shipping_date: string
          contact_email: string
          contact_phone: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_type: 'offer' | 'request'
          title: string
          description: string
          departure_city_china: string
          arrival_city_algeria: string
          port_loading: string
          port_arrival: string
          spots_count: number
          car_types: string
          estimated_shipping_date: string
          contact_email: string
          contact_phone: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_type?: 'offer' | 'request'
          title?: string
          description?: string
          departure_city_china?: string
          arrival_city_algeria?: string
          port_loading?: string
          port_arrival?: string
          spots_count?: number
          car_types?: string
          estimated_shipping_date?: string
          contact_email?: string
          contact_phone?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
