import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad — DivinAds',
    description: 'Cómo recopilamos, usamos y protegemos tu información.',
};

export default function PrivacyPage() {
    return (
        <main className="shell" style={{ maxWidth: 760, paddingBlock: 48 }}>
            <h1 style={{ color: '#6B21A8' }}>Política de Privacidad</h1>
            <p className="muted">Última actualización: 20 de abril de 2026</p>

            <h2>1. Quiénes somos</h2>
            <p>
                DivinAds ("<strong>nosotros</strong>", "<strong>la plataforma</strong>") es un servicio de gestión
                de publicidad en Meta (Facebook/Instagram) accesible en{' '}
                <strong>app.divinads.com</strong>. El responsable del tratamiento de datos es
                DivinAds y sus operadores autorizados.
            </p>

            <h2>2. Datos que recopilamos</h2>
            <h3>2.1 Datos que tú nos proporcionas</h3>
            <ul>
                <li>Nombre y dirección de correo electrónico (registro de cuenta).</li>
                <li>Tokens de acceso de Meta obtenidos a través del flujo OAuth de Facebook Login.</li>
            </ul>
            <h3>2.2 Datos recopilados automáticamente</h3>
            <ul>
                <li>Registros de actividad (qué operaciones se ejecutaron, cuándo y desde qué instalación de la extensión).</li>
                <li>Dirección IP para límite de velocidad y prevención de abuso.</li>
            </ul>
            <h3>2.3 Datos de Meta</h3>
            <p>
                Cuando conectas una cuenta Meta, obtenemos acceso a los permisos que autorizas
                expresamente: <code>ads_management</code>, <code>ads_read</code>,{' '}
                <code>business_management</code>, <code>pages_show_list</code>,{' '}
                <code>pages_read_engagement</code>, <code>read_insights</code>. Usamos estos datos
                exclusivamente para las funciones que solicitas dentro de la plataforma.
            </p>

            <h2>3. Cómo usamos tus datos</h2>
            <ul>
                <li>Autenticar tu sesión y mantener tu cuenta activa.</li>
                <li>Ejecutar las acciones de gestión de anuncios que tú inicias.</li>
                <li>Refrescar tokens de acceso antes de su vencimiento para evitar interrupciones.</li>
                <li>Detectar y prevenir fraude, abuso o acceso no autorizado.</li>
            </ul>
            <p>
                <strong>No vendemos ni compartimos tus datos con terceros</strong> salvo que sea
                necesario para prestar el servicio (por ejemplo, llamadas a la API de Meta en tu nombre)
                o cuando lo exija la ley.
            </p>

            <h2>4. Seguridad</h2>
            <ul>
                <li>Los tokens de acceso de Meta se almacenan cifrados (AES-256 vía pgcrypto) en la base de datos.</li>
                <li>Toda comunicación usa HTTPS/TLS.</li>
                <li>El acceso a los tokens está restringido mediante Row Level Security a nivel de base de datos.</li>
                <li>Los registros de auditoría son de solo adición (append-only) y no pueden modificarse ni eliminarse sin proceso administrativo.</li>
            </ul>

            <h2>5. Retención de datos</h2>
            <p>
                Los datos de sesión de extensiones inactivas se purgan a los 90 días. Los registros de
                auditoría se eliminan automáticamente pasados 90 días mediante un proceso cron
                administrado. Puedes solicitar la eliminación de tu cuenta y datos enviando un correo
                a <strong>privacidad@divinads.com</strong>.
            </p>

            <h2>6. Tus derechos</h2>
            <p>
                Tienes derecho a acceder, rectificar y suprimir tus datos personales, así como a
                oponerte a su tratamiento y solicitar la portabilidad, en los términos que establece
                el RGPD (si aplica) u otra normativa local. Para ejercer estos derechos, escríbenos a{' '}
                <strong>privacidad@divinads.com</strong>.
            </p>

            <h2>7. Cookies</h2>
            <p>
                Usamos únicamente cookies de sesión estrictamente necesarias para autenticación
                (httpOnly, Secure, SameSite=Lax). No usamos cookies de rastreo ni publicidad.
            </p>

            <h2>8. Cambios a esta política</h2>
            <p>
                Notificaremos cambios materiales por correo electrónico con al menos 14 días de
                antelación. El uso continuado del servicio tras esa fecha implica aceptación.
            </p>

            <h2>9. Contacto</h2>
            <p>
                Para cualquier consulta de privacidad: <strong>privacidad@divinads.com</strong>
            </p>

            <hr style={{ margin: '40px 0', border: 0, borderTop: '1px solid #E5E7EB' }} />
            <p className="muted" style={{ fontSize: 13 }}>
                <Link href="/">Inicio</Link> · <Link href="/terms">Términos de Servicio</Link>
            </p>
        </main>
    );
}
