import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos de Servicio — DivinAds',
    description: 'Condiciones de uso de la plataforma DivinAds.',
};

export default function TermsPage() {
    return (
        <main className="shell" style={{ maxWidth: 760, paddingBlock: 48 }}>
            <h1 style={{ color: '#6B21A8' }}>Términos de Servicio</h1>
            <p className="muted">Última actualización: 20 de abril de 2026</p>

            <h2>1. Aceptación</h2>
            <p>
                Al registrarte o usar DivinAds ("<strong>el Servicio</strong>") aceptas estos Términos
                de Servicio. Si no estás de acuerdo, no uses el Servicio.
            </p>

            <h2>2. Descripción del Servicio</h2>
            <p>
                DivinAds es una plataforma que permite a agencias y anunciantes gestionar campañas
                publicitarias en Meta (Facebook e Instagram) a través de una interfaz web y una extensión
                de Chrome, usando la API oficial de Meta.
            </p>

            <h2>3. Cuentas</h2>
            <ul>
                <li>Debes ser mayor de 18 años para crear una cuenta.</li>
                <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
                <li>Debes notificarnos inmediatamente de cualquier uso no autorizado de tu cuenta.</li>
                <li>Una cuenta por persona o entidad jurídica en el plan gratuito.</li>
            </ul>

            <h2>4. Uso aceptable</h2>
            <p>Te comprometes a no:</p>
            <ul>
                <li>Usar el Servicio para actividades ilegales o contrarias a las políticas de Meta.</li>
                <li>Intentar acceder a datos de otros usuarios o tenants.</li>
                <li>Realizar ingeniería inversa, descompilar o alterar el software.</li>
                <li>Sobrecargar intencionalmente la infraestructura (DDoS, scraping masivo).</li>
                <li>Revender o sublicenciar el acceso sin autorización escrita.</li>
            </ul>

            <h2>5. Planes y pagos</h2>
            <ul>
                <li>Ofrecemos planes de suscripción mensual y anual. Los precios están publicados en la plataforma.</li>
                <li>Los cargos son en USD y no reembolsables salvo disposición legal aplicable.</li>
                <li>La falta de pago puede resultar en suspensión del acceso tras 7 días de aviso.</li>
                <li>El plan gratuito (Trial) está sujeto a límites de uso y puede descontinuarse con 30 días de aviso.</li>
            </ul>

            <h2>6. Propiedad intelectual</h2>
            <p>
                DivinAds y sus logos son propiedad de sus respectivos titulares. El software de la
                plataforma está protegido por derechos de autor. No otorgamos ninguna licencia sobre
                nuestra propiedad intelectual más allá del acceso necesario para usar el Servicio.
            </p>

            <h2>7. Datos y privacidad</h2>
            <p>
                El tratamiento de datos personales se rige por nuestra{' '}
                <Link href="/privacy">Política de Privacidad</Link>, incorporada a estos Términos por
                referencia. Los datos de las cuentas Meta conectadas pertenecen al usuario y a Meta;
                DivinAds actúa como procesador autorizado.
            </p>

            <h2>8. Limitación de responsabilidad</h2>
            <p>
                El Servicio se proporciona "<strong>tal cual</strong>" sin garantías de disponibilidad
                continua. DivinAds no se responsabiliza de pérdidas derivadas de interrupciones del
                servicio, cambios en la API de Meta, o decisiones publicitarias tomadas por el usuario.
                La responsabilidad máxima de DivinAds no superará el importe pagado por el usuario
                en los 3 meses anteriores al incidente.
            </p>

            <h2>9. Suspensión y terminación</h2>
            <p>
                Podemos suspender o cancelar el acceso sin previo aviso si detectamos violación de estos
                Términos, actividad fraudulenta o riesgo de seguridad. El usuario puede cancelar su
                cuenta en cualquier momento desde el panel de configuración.
            </p>

            <h2>10. Modificaciones</h2>
            <p>
                Nos reservamos el derecho de modificar estos Términos. Notificaremos cambios materiales
                con 14 días de antelación por correo electrónico. El uso continuado implica aceptación.
            </p>

            <h2>11. Ley aplicable</h2>
            <p>
                Estos Términos se rigen por las leyes aplicables al lugar de establecimiento del
                operador. Cualquier disputa se resolverá preferentemente por mediación; en caso
                contrario, ante los tribunales competentes.
            </p>

            <h2>12. Contacto</h2>
            <p>
                Para consultas legales o contractuales: <strong>legal@divinads.com</strong>
            </p>

            <hr style={{ margin: '40px 0', border: 0, borderTop: '1px solid #E5E7EB' }} />
            <p className="muted" style={{ fontSize: 13 }}>
                <Link href="/">Inicio</Link> · <Link href="/privacy">Política de Privacidad</Link>
            </p>
        </main>
    );
}
