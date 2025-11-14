export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_mensagens: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_envio: string
          id: string
          id_medico: string
          id_paciente: string
          id_triagem: string | null
          mensagem: string | null
          remetente_tipo: string
          status: string
          tipo: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_envio?: string
          id?: string
          id_medico: string
          id_paciente: string
          id_triagem?: string | null
          mensagem?: string | null
          remetente_tipo: string
          status?: string
          tipo?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_envio?: string
          id?: string
          id_medico?: string
          id_paciente?: string
          id_triagem?: string | null
          mensagem?: string | null
          remetente_tipo?: string
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensagens_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensagens_id_triagem_fkey"
            columns: ["id_triagem"]
            isOneToOne: false
            referencedRelation: "triagens_ia"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          created_at: string
          data_consulta: string
          diagnostico: string | null
          duracao_minutos: number | null
          id: string
          link_video_chamada: string | null
          motivo_consulta: string | null
          observacoes: string | null
          paciente_id: string
          prescricao: string | null
          profissional_id: string
          status: string | null
          tipo_consulta: string | null
        }
        Insert: {
          created_at?: string
          data_consulta: string
          diagnostico?: string | null
          duracao_minutos?: number | null
          id?: string
          link_video_chamada?: string | null
          motivo_consulta?: string | null
          observacoes?: string | null
          paciente_id: string
          prescricao?: string | null
          profissional_id: string
          status?: string | null
          tipo_consulta?: string | null
        }
        Update: {
          created_at?: string
          data_consulta?: string
          diagnostico?: string | null
          duracao_minutos?: number | null
          id?: string
          link_video_chamada?: string | null
          motivo_consulta?: string | null
          observacoes?: string | null
          paciente_id?: string
          prescricao?: string | null
          profissional_id?: string
          status?: string | null
          tipo_consulta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      disponibilidade_profissional: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          profissional_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          profissional_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidade_profissional_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      emergencias: {
        Row: {
          created_at: string
          id: string
          localizacao: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["status_emergencia"]
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          localizacao?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_emergencia"]
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          localizacao?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_emergencia"]
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergencias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          completado: boolean
          created_at: string
          data_hora: string
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          completado?: boolean
          created_at?: string
          data_hora: string
          descricao?: string | null
          id?: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          completado?: boolean
          created_at?: string
          data_hora?: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicacoes: {
        Row: {
          ativo: boolean
          created_at: string
          dosagem: string | null
          frequencia: string
          horarios: string[] | null
          id: string
          nome_medicamento: string
          observacoes: string | null
          paciente_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dosagem?: string | null
          frequencia: string
          horarios?: string[] | null
          id?: string
          nome_medicamento: string
          observacoes?: string | null
          paciente_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dosagem?: string | null
          frequencia?: string
          horarios?: string[] | null
          id?: string
          nome_medicamento?: string
          observacoes?: string | null
          paciente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medico_paciente: {
        Row: {
          ativo: boolean
          data_vinculo: string
          id: string
          id_medico: string
          id_paciente: string
        }
        Insert: {
          ativo?: boolean
          data_vinculo?: string
          id?: string
          id_medico: string
          id_paciente: string
        }
        Update: {
          ativo?: boolean
          data_vinculo?: string
          id?: string
          id_medico?: string
          id_paciente?: string
        }
        Relationships: [
          {
            foreignKeyName: "medico_paciente_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medico_paciente_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alergias: string | null
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          condicoes_preexistentes: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          estado: string | null
          foto_url: string | null
          id: string
          medicamentos_uso_continuo: string | null
          nome: string
          numero: string | null
          observacoes_medicas: string | null
          rg: string | null
          sexo: string | null
          telefone: string | null
          tipo_sanguineo: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string
        }
        Insert: {
          alergias?: string | null
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          condicoes_preexistentes?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          id: string
          medicamentos_uso_continuo?: string | null
          nome: string
          numero?: string | null
          observacoes_medicas?: string | null
          rg?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_sanguineo?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
        }
        Update: {
          alergias?: string | null
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          condicoes_preexistentes?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          medicamentos_uso_continuo?: string | null
          nome?: string
          numero?: string | null
          observacoes_medicas?: string | null
          rg?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_sanguineo?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          area_atuacao: string | null
          created_at: string
          crm: string | null
          especialidade: string
          experiencia: string | null
          id: string
          local_atendimento: string | null
          profile_id: string
          registro_profissional: string | null
        }
        Insert: {
          area_atuacao?: string | null
          created_at?: string
          crm?: string | null
          especialidade: string
          experiencia?: string | null
          id?: string
          local_atendimento?: string | null
          profile_id: string
          registro_profissional?: string | null
        }
        Update: {
          area_atuacao?: string | null
          created_at?: string
          crm?: string | null
          especialidade?: string
          experiencia?: string | null
          id?: string
          local_atendimento?: string | null
          profile_id?: string
          registro_profissional?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prontuarios: {
        Row: {
          alergias: string | null
          created_at: string
          historico_medico: string | null
          id: string
          medicamentos_uso: string | null
          observacoes: string | null
          paciente_id: string
          updated_at: string
        }
        Insert: {
          alergias?: string | null
          created_at?: string
          historico_medico?: string | null
          id?: string
          medicamentos_uso?: string | null
          observacoes?: string | null
          paciente_id: string
          updated_at?: string
        }
        Update: {
          alergias?: string | null
          created_at?: string
          historico_medico?: string | null
          id?: string
          medicamentos_uso?: string | null
          observacoes?: string | null
          paciente_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      triagens_ia: {
        Row: {
          chat_expira_em: string | null
          classificacao:
            | Database["public"]["Enums"]["classificacao_triagem"]
            | null
          created_at: string
          especialidade_recomendada: string | null
          id: string
          id_medico_vinculado: string | null
          recomendacao: string | null
          resposta_ia: string | null
          sintomas: string
          usuario_id: string
        }
        Insert: {
          chat_expira_em?: string | null
          classificacao?:
            | Database["public"]["Enums"]["classificacao_triagem"]
            | null
          created_at?: string
          especialidade_recomendada?: string | null
          id?: string
          id_medico_vinculado?: string | null
          recomendacao?: string | null
          resposta_ia?: string | null
          sintomas: string
          usuario_id: string
        }
        Update: {
          chat_expira_em?: string | null
          classificacao?:
            | Database["public"]["Enums"]["classificacao_triagem"]
            | null
          created_at?: string
          especialidade_recomendada?: string | null
          id?: string
          id_medico_vinculado?: string | null
          recomendacao?: string | null
          resposta_ia?: string | null
          sintomas?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "triagens_ia_id_medico_vinculado_fkey"
            columns: ["id_medico_vinculado"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triagens_ia_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voluntarios: {
        Row: {
          created_at: string
          disponibilidade: string | null
          id: string
          profile_id: string
          tipo_ajuda: string
        }
        Insert: {
          created_at?: string
          disponibilidade?: string | null
          id?: string
          profile_id: string
          tipo_ajuda: string
        }
        Update: {
          created_at?: string
          disponibilidade?: string | null
          id?: string
          profile_id?: string
          tipo_ajuda?: string
        }
        Relationships: [
          {
            foreignKeyName: "voluntarios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_vinculo_medico_paciente: {
        Args: { p_id_paciente: string; p_id_triagem: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "profissional" | "paciente"
      classificacao_triagem: "leve" | "moderado" | "grave" | "emergencia"
      status_emergencia: "ativa" | "em_atendimento" | "resolvida" | "cancelada"
      tipo_usuario: "paciente" | "profissional" | "familiar" | "voluntario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "profissional", "paciente"],
      classificacao_triagem: ["leve", "moderado", "grave", "emergencia"],
      status_emergencia: ["ativa", "em_atendimento", "resolvida", "cancelada"],
      tipo_usuario: ["paciente", "profissional", "familiar", "voluntario"],
    },
  },
} as const
