import { getBusinesses } from '@/app/actions/superadmin'
import { BusinessTable } from '@/components/superadmin/BusinessTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function NegociosPage() {
  const businesses = await getBusinesses()
  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Negocios</h1>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button className="gap-2"><Plus className="w-4 h-4" />Nuevo</Button>
        </Link>
      </div>
      <BusinessTable businesses={businesses as any} />
    </div>
  )
}
