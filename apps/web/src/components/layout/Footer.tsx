import Link from 'next/link'
import { Globe, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-[--brand-secondary] text-white pt-20 pb-10">
            <div className="max-w-[--container-max] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Col 1: Brand */}
                <div className="space-y-6">
                    <Link href="/">
                        <h2 className="text-3xl font-display font-black tracking-tighter">
                            HAPPY <span className="text-[--brand-primary]">S.A.C.</span>
                        </h2>
                    </Link>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Fabricando alegría en cada disfraz. Calidad premium peruana para las festividades más importantes del año.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 bg-white/5 hover:bg-[--brand-primary] rounded-lg transition-all"><Globe size={20} /></a>
                        <a href="#" className="p-2 bg-white/5 hover:bg-[--brand-primary] rounded-lg transition-all"><Phone size={20} /></a>
                        <a href="#" className="p-2 bg-white/5 hover:bg-[--brand-primary] rounded-lg transition-all"><Mail size={20} /></a>
                    </div>
                </div>

                {/* Col 2: Tienda */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Tienda</h3>
                    <ul className="space-y-4 text-sm font-bold">
                        <li><Link href="/catalogo" className="hover:text-[--brand-primary] transition-colors">Ver Catálogo</Link></li>
                        <li><Link href="/catalogo?categoria=fiestas-patrias" className="hover:text-[--brand-primary] transition-colors">Fiestas Patrias</Link></li>
                        <li><Link href="/catalogo?categoria=halloween" className="hover:text-[--brand-primary] transition-colors">Halloween</Link></li>
                        <li><Link href="/catalogo?categoria=navidad" className="hover:text-[--brand-primary] transition-colors">Navidad</Link></li>
                        <li><Link href="/catalogo?categoria=ofertas" className="text-[--brand-accent] hover:underline">Ofertas Especiales</Link></li>
                    </ul>
                </div>

                {/* Col 3: Empresa */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Empresa</h3>
                    <ul className="space-y-4 text-sm font-bold">
                        <li><Link href="/nosotros" className="hover:text-[--brand-primary] transition-colors">Quiénes Somos</Link></li>
                        <li><Link href="/contacto" className="hover:text-[--brand-primary] transition-colors">Contacto</Link></li>
                        <li><Link href="/terminos" className="hover:text-[--brand-primary] transition-colors">Términos y Condiciones</Link></li>
                        <li><Link href="/privacidad" className="hover:text-[--brand-primary] transition-colors">Privacidad</Link></li>
                    </ul>
                </div>

                {/* Col 4: Contacto */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Atención al Cliente</h3>
                    <ul className="space-y-4 text-sm font-bold">
                        <li className="flex items-start gap-3">
                            <Phone size={18} className="text-[--brand-primary] shrink-0" />
                            <span>+51 916 854 842</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Mail size={18} className="text-[--brand-primary] shrink-0" />
                            <span>ventas@happysac.com.pe</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-[--brand-primary] shrink-0" />
                            <span>Av. José Leal 1234, Lince, Lima</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[--container-max] mx-auto px-6 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                <p className="text-xs text-slate-500 font-bold">
                    © {new Date().getFullYear()} HAPPY S.A.C. Hecho en Perú 🇵🇪
                </p>
                <div className="flex items-center gap-4 grayscale opacity-50">
                    {/* Logo mockups for payment methods */}
                    <span className="text-[10px] font-black border border-white/20 px-2 py-1 rounded">VISA</span>
                    <span className="text-[10px] font-black border border-white/20 px-2 py-1 rounded">MASTERCARD</span>
                    <span className="text-[10px] font-black border border-white/20 px-2 py-1 rounded">YAPE</span>
                </div>
            </div>
        </footer>
    )
}
