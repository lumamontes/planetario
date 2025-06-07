'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/database'
import Link from 'next/link'
import AvatarGenerator from './AvatarGenerator'

interface SettingsFormProps {
  user: User
  profile: Profile | null
}

export default function SettingsForm({ user, profile }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<'avatar' | 'account' | 'privacy'>('avatar')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  // Profile state - username and avatar only
  const [username, setUsername] = useState(profile?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username.toLowerCase().trim(),
          avatar_url: avatarUrl 
        })
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este nome de usuário já está em uso')
        }
        throw error
      }

      setMessage('Perfil atualizado com sucesso!')
      setMessageType('success')
    } catch (error: any) {
      setMessage(error.message || 'Erro ao atualizar perfil')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage('O tamanho do arquivo deve ser menor que 5MB')
      setMessageType('error')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Por favor, faça o upload de um arquivo de imagem')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(`avatars/${fileName}`, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`avatars/${fileName}`)

      setAvatarUrl(publicUrl)
      setMessage('Avatar enviado com sucesso!')
      setMessageType('success')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage('Erro ao fazer upload do avatar. Por favor, tente novamente.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error
      
      // Redirect will happen automatically when user is deleted
    } catch (error: any) {
      console.error('Error deleting account:', error)
      showMessage('Erro ao excluir conta: ' + error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'avatar', label: 'PERFIL', icon: '👤' },
    { id: 'account', label: 'CONTA', icon: '⚙️' },
    { id: 'privacy', label: 'PRIVACIDADE', icon: '🔒' }
  ]

  return (
    <>
      {/* Navigation */}
      <div className="border border-green-400 p-4 mb-6 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/dashboard" 
            className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm rounded"
          >
            ← Voltar ao Painel
          </Link>
          <Link 
            href="/planets" 
            className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm rounded"
          >
            🌌 Ver Meus Planetas
          </Link>
        </div>
      </div>

      {/* Tab Navigation - keeping window style */}
      <div className="border border-green-400 mb-6 rounded-lg">
        <div className="bg-green-400 text-black px-4 py-2 flex items-center rounded-t-lg">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 mr-4"></div>
          <span className="font-bold">Configurações</span>
        </div>
        <div className="flex flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-r border-green-400 transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-green-400 text-black'
                  : 'hover:bg-green-900 text-green-400'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`border p-3 mb-6 rounded ${
          messageType === 'error' 
            ? 'border-red-400 text-red-400' 
            : 'border-green-400 text-green-400'
        }`}>
          <p>{message}</p>
        </div>
      )}

      {/* Profile Tab (renamed from Avatar) */}
      {activeTab === 'avatar' && (
        <div className="border border-green-400 p-6 rounded-lg">
          <h2 className="text-xl mb-6">Configurações do Perfil</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm mb-2">Nome de usuário:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 rounded"
                placeholder="Digite seu nome de usuário..."
                required
                maxLength={30}
              />
              <div className="text-xs text-green-600 mt-1">
                {username.length}/30 caracteres • Apenas letras minúsculas, números e _
              </div>
            </div>

            {/* Avatar Section */}
            <div>
              <label className="block text-sm mb-2">Avatar:</label>
              
              {/* Current Avatar Display */}
              <div className="mb-4">
                <div className="text-xs text-green-600 mb-2">Avatar atual:</div>
                <div className="flex items-center space-x-4">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar atual" 
                      className="w-16 h-16 border border-green-400 rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 border border-green-400 bg-gray-800 flex items-center justify-center rounded">
                      <span className="text-gray-400">?</span>
                    </div>
                  )}
                  <div className="text-xs text-green-600">
                    {avatarUrl ? 'Avatar personalizado ativo' : 'Nenhum avatar definido'}
                  </div>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="mb-4">
                <div className="text-xs text-green-600 mb-2">Upload de arquivo:</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 file:bg-green-400 file:text-black file:border-0 file:px-3 file:py-1 file:mr-3 file:rounded rounded"
                />
                <div className="text-xs text-green-600 mt-1">
                  Formatos suportados: JPG, PNG, GIF • Tamanho máximo: 5MB
                </div>
              </div>

              {/* Avatar Generator */}
              <div>
                <div className="text-xs text-green-600 mb-2">Gerador de avatar:</div>
                <AvatarGenerator onAvatarGenerated={setAvatarUrl} />
              </div>
            </div>

            <div className="border-t border-green-400 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-green-400 text-black font-bold hover:bg-green-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors rounded"
              >
                {isLoading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="border border-green-400 p-6 rounded-lg">
          <h2 className="text-xl mb-6">Informações da Conta</h2>
          
          <div className="space-y-6">
            {/* Account Info */}
            <div>
              <h3 className="text-lg mb-4">Detalhes da conta:</h3>
              <div className="space-y-2 text-sm">
                <p>Email: {user.email}</p>
                <p>ID do usuário: {user.id}</p>
                <p>Conta criada: {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                <p>Último login: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}</p>
              </div>
            </div>

            {/* Password Reset */}
            <div>
              <h3 className="text-lg mb-4">Segurança:</h3>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
                      redirectTo: `${window.location.origin}/auth/callback?next=/settings`
                    })
                    if (error) throw error
                    setMessage('Email de redefinição de senha enviado!')
                    setMessageType('success')
                  } catch (error: any) {
                    setMessage('Erro ao enviar email: ' + error.message)
                    setMessageType('error')
                  }
                }}
                className="px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
              >
                🔑 Alterar Senha
              </button>
            </div>

            {/* Data Export */}
            <div>
              <h3 className="text-lg mb-4">Dados:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // TODO: Implement data export
                    alert('Funcionalidade de exportação de dados em breve!')
                  }}
                  className="block px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
                >
                  📦 Baixar Meus Dados
                </button>
                <div className="text-xs text-green-600">
                  Inclui perfil, planetas, conteúdo e dados analíticos
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="border border-green-400 p-6 rounded-lg">
          <h2 className="text-xl mb-6">Privacidade e Segurança</h2>
          
          <div className="space-y-6">
            {/* Data Usage */}
            <div>
              <h3 className="text-lg mb-4">Coleta de dados:</h3>
              <div className="space-y-2 text-sm">
                <p>• Coletamos análises básicas sobre visitas aos planetas (IP, país, referência)</p>
                <p>• Estes dados ajudam você a entender sua audiência</p>
                <p>• Nenhuma informação pessoal é compartilhada com terceiros</p>
                <p>• Você pode exportar ou excluir seus dados a qualquer momento</p>
              </div>
            </div>

            {/* Platform Usage */}
            <div>
              <h3 className="text-lg mb-4">Uso da plataforma:</h3>
              <div className="space-y-2 text-sm">
                <p>• Seus planetas podem ser públicos (descobríveis) ou privados (apenas link direto)</p>
                <p>• Nome de usuário e avatar são usados para identificação do criador</p>
                <p>• Todo conteúdo que você cria pertence a você</p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-400 p-4 rounded-lg">
              <h3 className="text-red-400 text-lg mb-4">⚠️ Zona de Perigo</h3>
              <div className="space-y-4">
                <div className="text-sm text-red-300">
                  <p>AVISO: Estas ações não podem ser desfeitas!</p>
                </div>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors disabled:opacity-50 rounded"
                >
                  {isLoading ? 'Excluindo...' : '🗑️ Excluir Conta'}
                </button>
                
                <div className="text-xs text-red-400">
                  <p>Isso excluirá permanentemente:</p>
                  <p>• Sua conta e todos os dados pessoais</p>
                  <p>• Todos os seus planetas e seu conteúdo</p>
                  <p>• Todas as análises e dados de visitantes</p>
                  <p>• Todos os arquivos de mídia enviados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 