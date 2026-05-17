'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Download, Printer, ShieldCheck, ShoppingBag } from 'lucide-react';
import { fetchReceiptData } from '@/lib/api/checkout';

export default function ReceiptPage() {
  const params = useParams();
  const sessionToken = params.sessionToken as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceiptData(sessionToken)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionToken]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando recibo...</div>;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
           <p className="text-gray-500 mb-4">Não foi possível carregar as informações deste recibo.</p>
           <button onClick={() => window.location.href = '/'} className="text-indigo-600 font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  const total = (data.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: data.currency });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Pagamento Aprovado!</h1>
          <p className="text-indigo-100 text-sm">Seu pedido foi processado com sucesso.</p>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Empresa</p>
              <p className="font-bold text-gray-900">{data.system_name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Pedido</p>
              <p className="font-mono text-sm text-gray-600">#{data.order_number.substring(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
             <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Detalhes da Compra</h3>
             {data.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                   <span className="text-gray-600">{item.quantity}x {item.name}</span>
                   <span className="font-medium">{((item.unit_price * item.quantity) / 100).toLocaleString('pt-BR', { style: 'currency', currency: data.currency })}</span>
                </div>
             ))}
             <div className="pt-4 flex justify-between items-center text-lg font-black text-gray-900">
                <span>Total Pago</span>
                <span className="text-indigo-600">{total}</span>
             </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-2 gap-6 mb-8">
             <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Método</p>
                <p className="text-sm font-bold text-gray-700 uppercase">{data.method}</p>
             </div>
             <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Data</p>
                <p className="text-sm font-bold text-gray-700">{new Date(data.paid_at).toLocaleString('pt-BR')}</p>
             </div>
             <div className="col-span-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Comprador</p>
                <p className="text-sm font-bold text-gray-700">{data.customer.name} ({data.customer.email})</p>
             </div>
          </div>

          <div className="flex gap-4 mb-8">
             <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                <Printer size={16} /> Imprimir Recibo
             </button>
             <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                <Download size={16} /> Baixar PDF
             </button>
          </div>

          <div className="text-center">
             <p className="text-xs text-gray-400 mb-6">
                Este é um comprovante oficial de pagamento processado pela Basileia Pay.
             </p>
             <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm cursor-pointer hover:underline">
                <ShoppingBag size={16} />
                <span>Voltar para a loja</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
