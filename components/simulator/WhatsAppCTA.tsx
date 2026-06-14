'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppCTAProps {
  whatsappNumber: string
  whatsappMessage: string
  businessName: string
  primaryColor: string
  onClick: () => void
}

export function WhatsAppCTA({
  whatsappNumber,
  whatsappMessage,
  businessName,
  primaryColor,
  onClick,
}: WhatsAppCTAProps) {
  const message =
    whatsappMessage ||
    `Hola, acabo de hacer mi simulación en ${businessName} y me gustaría agendar una consulta gratuita 😊`

  const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={onClick} className="block w-full">
      <button
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-transform active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageCircle className="w-6 h-6" />
        Agendar mi consulta gratis
      </button>
    </a>
  )
}
