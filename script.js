// Gerenciador de Notas
class GerenciadorNotas {
    constructor() {
        this.notas = [];
        this.notaAtual = null;
        this.debounceTimer = null; // Para debounce do editor visual
        this.carregarNotas();
        this.inicializarEventos();
        this.renderizarLista();
    }

    // Carregar notas do localStorage ou usar dados padrão
    carregarNotas() {
        const notasSalvas = localStorage.getItem('notasMaritimas');
        if (notasSalvas) {
            this.notas = JSON.parse(notasSalvas);
            // Migrar notas antigas que usam "conteudo" para "template"
            let precisaSalvar = false;
            this.notas = this.notas.map(nota => {
                if (nota.conteudo && !nota.template) {
                    // Converter texto simples para HTML básico
                    nota.template = this.converterTextoParaHTML(nota.conteudo);
                    delete nota.conteudo;
                    precisaSalvar = true;
                }
                return nota;
            });
            
            // Verificar se temos os templates padrão, se não, adicionar
            const temCFN = this.notas.some(n => n.nome && n.nome.includes('CFN'));
            const temCertificado = this.notas.some(n => n.nome && n.nome.includes('Certificado de Retirada'));
            
            if (!temCFN || !temCertificado) {
                // Adicionar templates padrão que estão faltando
                let novoId = this.notas.length > 0 ? Math.max(...this.notas.map(n => n.id)) + 1 : 1;
                if (!temCFN) {
                    this.notas.unshift({
                        id: novoId++,
                        nome: 'Comprovante de Fornecimento a Navio - CFN',
                        template: this.getTemplateCFN()
                    });
                    precisaSalvar = true;
                }
                if (!temCertificado) {
                    this.notas.unshift({
                        id: novoId++,
                        nome: 'Certificado de Retirada de Resíduo',
                        template: this.getTemplateCertificadoResiduo()
                    });
                    precisaSalvar = true;
                }
            }
            
            // ATUALIZAR templates antigos que não têm logo
            this.notas = this.notas.map(nota => {
                if (nota.nome && nota.nome.includes('CFN') && nota.template && !nota.template.includes('LOGO SEVEN')) {
                    nota.template = this.getTemplateCFN();
                    precisaSalvar = true;
                } else if (nota.nome && nota.nome.includes('Certificado de Retirada') && nota.template && !nota.template.includes('LOGO SEVEN')) {
                    nota.template = this.getTemplateCertificadoResiduo();
                    precisaSalvar = true;
                }
                return nota;
            });
            
            if (precisaSalvar) {
                this.salvarNotas();
            }
        } else {
            // Dados padrão com templates baseados nos documentos reais
            this.notas = [
                {
                    id: 1,
                    nome: 'Comprovante de Fornecimento a Navio - CFN',
                    template: this.getTemplateCFN()
                },
                {
                    id: 2,
                    nome: 'Certificado de Retirada de Resíduo',
                    template: this.getTemplateCertificadoResiduo()
                }
            ];
            this.salvarNotas();
        }
    }

    // Converter texto simples para HTML básico
    converterTextoParaHTML(texto) {
        const linhas = texto.split('\n');
        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }</style></head><body>';
        linhas.forEach(linha => {
            if (linha.trim() === '') {
                html += '<br>';
            } else if (linha.trim().startsWith('#')) {
                html += `<h1>${linha.replace('#', '').trim()}</h1>`;
            } else {
                html += `<p>${linha}</p>`;
            }
        });
        html += '</body></html>';
        return html;
    }

    // Template CFN (Comprovante de Fornecimento a Navio)
    getTemplateCFN() {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="data:,">
    <style>
        @page {
            size: A4;
            margin: 5mm 10mm;
        }
        * { 
            box-sizing: border-box; 
            margin: 0;
            padding: 0;
        }
        body { 
            font-family: Arial, Helvetica, sans-serif; 
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
            font-size: 14px;
            line-height: 1.3;
        }
        .document-container {
            width: 210mm;
            max-height: 287mm;
            margin: 0 auto;
            background: white;
            padding: 5mm 10mm;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px;
            padding-bottom: 15px;
        }
        .logo-container {
            margin-bottom: 12px;
            text-align: center;
        }
        .logo-container img {
            height: 50px;
            width: auto;
            max-width: 150px;
        }
        .logo-container img[src=""] {
            display: none;
        }
        .header h1 { 
            font-size: 20px; 
            margin: 10px 0 8px 0;
            color: #1d1b78;
            font-weight: bold;
        }
        .header p { 
            font-size: 12px; 
            margin: 3px 0;
            color: #000;
            line-height: 1.5;
        }
        .document-title {
            text-align: center;
            margin: 20px 0 10px 0;
            font-size: 18px;
            font-weight: bold;
            color: #1d1b78;
            background: transparent;
        }
        .document-subtitle {
            text-align: center;
            font-size: 11px;
            color: #000;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 8px 0; 
            font-size: 13px;
            border: 1px solid #1d1b78;
            page-break-inside: avoid;
        }
        table td { 
            border: 1px solid #1d1b78; 
            padding: 8px 6px;
            vertical-align: middle;
        }
        .label { 
            font-weight: bold; 
            background: #fff;
            color: #1d1b78;
            font-size: 12px;
            text-align: left;
            padding: 8px 6px;
        }
        .blank { 
            min-height: 30px;
            background: #fff;
        }
        .value-cell {
            background: #fff;
            font-weight: normal;
            color: #000;
            text-align: center;
        }
        .footer { 
            margin-top: 12px; 
            font-size: 10px;
            padding: 8px;
            line-height: 1.5;
        }
        .footer p {
            margin: 4px 0;
        }
        .signature-area { 
            margin-top: 15px;
            display: table;
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
        }
        .signature-box { 
            display: table-cell;
            width: 50%;
            border: 1px solid #1d1b78;
            padding: 8px 6px;
            vertical-align: top;
            text-align: center;
        }
        .signature-box:first-child {
            border-right: none;
        }
        .signature-box:last-child {
            border-left: 1px solid #1d1b78;
        }
        .signature-box p {
            margin: 0 0 6px 0;
            font-weight: bold;
            color: #1d1b78;
            font-size: 11px;
        }
        .signature-box div {
            border: 1px solid #1d1b78;
            min-height: 50px;
            margin-top: 6px;
            background: #fff;
        }
        .signature-box .signature-label {
            margin-top: 8px;
            font-size: 10px;
            color: #000;
            text-align: center;
        }
        @media print { 
            body { margin: 0; padding: 0; }
            .document-container { 
                width: 100%;
                padding: 5mm 10mm;
                box-shadow: none;
                max-height: 287mm;
            }
            table { page-break-inside: avoid; }
            .signature-area { page-break-inside: avoid; }
            .footer { page-break-inside: avoid; }
            * { page-break-inside: avoid; }
        }
        @media screen {
            body { background: #e5e5e5; padding: 20px; }
            .document-container { box-shadow: 0 0 25px rgba(0,0,0,0.15); }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <table style="margin-bottom: 8px;">
            <tr>
                <td style="width: 25%; padding: 8px; border: 1px solid #1d1b78; vertical-align: middle; text-align: center;">
                    <div class="logo-container" style="margin: 0;">
                        <img src="assets/logo/LOGO SEVEN.svg" alt="SEVEN NAVEGAÇÃO" onerror="this.style.display='none';" />
                    </div>
                </td>
                <td style="width: 75%; padding: 8px; border: 1px solid #1d1b78; border-left: 1px solid #1d1b78; vertical-align: middle;">
                    <h1 style="font-size: 16px; margin: 0 0 4px 0; color: #1d1b78; font-weight: bold; text-align: left;">SEVEN NAVEGAÇÃO LTDA</h1>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">Av. Dos Holandeses, Ed. tech Office, Salas 918 a 920 - Ponta D'Areia</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">São Luís - MA - CEP: 65.077-357</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">Fone: 98 99117-1988 e 99161-5880</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">www.sevennav.com.br | recepcao.apoioportuario@gmail.com</p>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: center; padding: 6px; border: 1px solid #1d1b78; border-top: 1px solid #1d1b78;">
                    <div style="font-size: 14px; font-weight: bold; color: #1d1b78; margin-bottom: 4px;">
                        Comprovante de Fornecimento a Navio - CFN (Bunker Deliver Note - BDN)
                    </div>
                    <p style="font-size: 9px; color: #000; margin: 0; line-height: 1.3;">
                        Preencher com letras de forma - <strong>NÃO RASURAR</strong> (Fill in with block letters - <strong>WITHOUT any amendment</strong>)
                    </p>
                </td>
            </tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 28%;">Nº do CFN (BDN nº)</td>
                <td class="blank" style="width: 36%;"></td>
                <td class="label" style="width: 36%;">Nome do Navio (Ship's name)</td>
            </tr>
            <tr>
                <td class="label">Cliente (Customer):</td>
                <td class="blank"></td>
                <td class="label">Bandeira (Flag):</td>
            </tr>
            <tr>
                <td class="label">Nº IMO do Navio (Ship's IMO)</td>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 50%;">Nº do lacre da amostra do navio (Ship's sample seal nº):</td>
                <td class="label" style="width: 50%;">Nº do lacre da amostra da SEVEN (SEVEN sample seal nº):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
            <tr>
                <td class="label" colspan="2">Nº do lacre da amostra da MARPOL (MARPOL sample seal nº):</td>
            </tr>
            <tr>
                <td class="blank" colspan="2"></td>
            </tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 33%;">Local de Fornecimento (Supply Area):</td>
                <td class="label" style="width: 33%;">Porto (Port):</td>
                <td class="label" style="width: 34%;">Órgão (Origin):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
            <tr>
                <td class="label">Nº do anexo único/processo (Process nº):</td>
                <td class="blank"></td>
                <td class="label">Produto (Grade):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 33%;">Volume Ambiente (Observed Volume):</td>
                <td class="label" style="width: 33%;">Volume 20ºC (Volume at 20ºC):</td>
                <td class="label" style="width: 34%;">Quantidade (Quantity): (XXXX.YYY)</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
            <tr>
                <td class="label">Densidade 20ºC (Specific Gravity at 20ºC.):</td>
                <td class="label">Temperatura (Temperature):</td>
                <td class="label">Fator de Correção (Correction Factor):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 50%;">Operação (Operation):</td>
                <td class="blank" style="width: 50%;"></td>
            </tr>
            <tr>
                <td class="label">Entrega por (Delivered by):</td>
                <td class="label">Início (Start):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
            <tr>
                <td class="label">Término (End):</td>
                <td class="label">Nome da Barcaça (Barge name):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
            <tr>
                <td class="label">Oleoduto (Pipeline):</td>
                <td class="label">Caminhão (Truck):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
            <tr>
                <td class="label">Data (Date): (DD/MM/YYYY)</td>
                <td class="label">Hora (Time):</td>
            </tr>
            <tr>
                <td class="blank"></td>
                <td class="blank"></td>
            </tr>
        </table>

        <div class="footer">
            <p>Atenção: As reclamações somente serão aceitas quando recebidas dentro de 15 dias corridos da data de entrega. Attention: The claims shall only accept if received within 15 running days from delivery date</p>
            <p>Foi emitida carta protesto? (Was a Letter of Protest issued?): Sim(Yes) ☐ Não(No) ☐</p>
            <p>O Bunker aqui fornecido atende aos regulamentos 14 e 18(1) da MARPOL 73/78 Anexo VI The bunker herein supplied is in conformity with regulations 14 and 18(1) of MARPOL 73/74 Annex VI</p>
            <p style="margin-top: 15px; font-weight: bold;">Nome em letra de forma, Assinaturas e carimbos (Names in block letters, Signatures and Stamps)</p>
        </div>

        <div class="signature-area">
            <div class="signature-box">
                <p>Representante do Navio (Ship's Representative)</p>
                <div></div>
                <p class="signature-label"></p>
            </div>
            <div class="signature-box">
                <p>Representante da SEVEN (SEVEN Representative)</p>
                <div></div>
                <p class="signature-label"></p>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    // Template Certificado de Retirada de Resíduo
    getTemplateCertificadoResiduo() {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="data:,">
    <style>
        @page {
            size: A4;
            margin: 5mm 10mm;
        }
        * { 
            box-sizing: border-box; 
            margin: 0;
            padding: 0;
        }
        body { 
            font-family: Arial, 'Helvetica Neue', sans-serif; 
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
            font-size: 13px;
            line-height: 1.3;
        }
        .document-container {
            width: 210mm;
            max-height: 287mm;
            margin: 0 auto;
            background: white;
            padding: 5mm 10mm;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 4px solid #1d1b78;
            padding-bottom: 15px;
        }
        .logo-container {
            margin-bottom: 10px;
            text-align: center;
        }
        .logo-container img {
            height: 50px;
            width: auto;
            max-width: 150px;
        }
        .header h1 { 
            font-size: 22px; 
            margin: 10px 0 8px 0;
            color: #1d1b78;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .header p { 
            font-size: 12px; 
            margin: 4px 0;
            color: #333;
        }
        .document-title {
            text-align: center;
            margin: 20px 0 12px 0;
            padding: 18px;
            background: transparent;
            color: #1d1b78;
            font-size: 18px;
            font-weight: bold;
        }
        .cert-number { 
            text-align: right; 
            font-size: 12px; 
            margin-bottom: 8px;
            padding: 6px 10px;
            background: #fff;
            border-left: 5px solid #1d1b78;
            font-weight: bold;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 8px 0; 
            font-size: 12px;
            border: 1px solid #1d1b78;
            page-break-inside: avoid;
        }
        table td { 
            border: 1px solid #1d1b78; 
            padding: 8px 6px;
            vertical-align: middle;
        }
        table th {
            border: 1px solid #1d1b78;
            padding: 8px 6px;
            vertical-align: middle;
        }
        .label { 
            font-weight: bold; 
            background: #fff;
            color: #1d1b78;
            width: 35%;
            font-size: 11px;
            text-align: left;
        }
        .blank { 
            min-height: 30px;
            background: #fff;
        }
        .declaration { 
            margin: 20px 0; 
            font-size: 12px; 
            line-height: 1.7;
            padding: 18px;
            background: #f8f8f8;
            border-left: 5px solid #1d1b78;
        }
        .declaration p {
            margin: 8px 0;
        }
        .garbage-table { 
            margin: 10px 0; 
        }
        .garbage-table th { 
            background: #fff;
            color: #1d1b78;
            font-weight: bold; 
            text-align: center;
            padding: 8px 4px;
            font-size: 11px;
        }
        .garbage-table td {
            text-align: center;
            padding: 6px 4px;
        }
        .signature-area { 
            margin-top: 12px;
            display: table;
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
        }
        .signature-box { 
            display: table-cell;
            width: 50%;
            border: 1px solid #1d1b78;
            padding: 8px 6px;
            vertical-align: top;
        }
        .signature-box:first-child {
            border-right: none;
        }
        .signature-box:last-child {
            border-left: 1px solid #1d1b78;
        }
        .signature-box p {
            margin: 0 0 6px 0;
            font-weight: bold;
            color: #1d1b78;
            font-size: 11px;
        }
        .signature-box .signature-field {
            font-size: 10px;
            margin: 4px 0;
            color: #333;
        }
        .signature-box div {
            border: 1px solid #1d1b78;
            min-height: 50px;
            margin-top: 6px;
        }
        .signature-box .signature-label {
            margin-top: 8px;
            font-size: 10px;
            color: #666;
        }
        @media print { 
            body { margin: 0; padding: 0; }
            .document-container { 
                width: 100%;
                padding: 5mm 10mm;
                box-shadow: none;
                max-height: 287mm;
            }
            table { page-break-inside: avoid; }
            .garbage-table { page-break-inside: avoid; }
            .signature-area { page-break-inside: avoid; }
            * { page-break-inside: avoid; }
        }
        @media screen {
            body { background: #e5e5e5; padding: 20px; }
            .document-container { box-shadow: 0 0 20px rgba(0,0,0,0.2); }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <table style="margin-bottom: 8px;">
            <tr>
                <td style="width: 25%; padding: 8px; border: 1px solid #1d1b78; vertical-align: middle; text-align: center;">
                    <div class="logo-container" style="margin: 0;">
                        <img src="assets/logo/LOGO SEVEN.svg" alt="SEVEN NAVEGAÇÃO" style="max-width: 100%; height: auto;" onerror="this.style.display='none';" />
                    </div>
                </td>
                <td style="width: 75%; padding: 8px; border: 1px solid #1d1b78; border-left: 1px solid #1d1b78; vertical-align: middle;">
                    <h1 style="font-size: 16px; margin: 0 0 4px 0; color: #1d1b78; font-weight: bold; text-align: left;">SEVEN NAVEGAÇÃO LTDA</h1>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">Av. Dos Holandeses, Ed. tech Office, Salas 918 a 920 - Ponta D'Areia</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">São Luís - MA - CEP: 65.077-357</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">Fone: 98 99117-1988 e 99161-5880</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">www.sevennav.com.br | recepcao.apoioportuario@gmail.com</p>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: center; padding: 6px; border: 1px solid #1d1b78; border-top: 1px solid #1d1b78;">
                    <div style="font-size: 14px; font-weight: bold; color: #1d1b78; margin-bottom: 4px;">
                        CERTIFICADO DE RETIRADA DE RESÍDUO
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #1d1b78; margin-top: 4px;">
                        <strong>CERTIFICADO N. (Certificate No.):</strong> <span style="border-bottom: 2px solid #1d1b78; padding: 0 15px; font-weight: bold; font-size: 14px; margin-left: 8px;">&nbsp;</span>
                    </div>
                </td>
            </tr>
        </table>

    <table>
        <tr>
            <td class="label" style="width: 50%;">Navio (Ship):</td>
            <td class="blank" style="width: 50%;"></td>
        </tr>
        <tr>
            <td class="label">IMO:</td>
            <td class="blank"></td>
        </tr>
        <tr>
            <td class="label">PORTO (PORT):</td>
            <td class="label">HORA (Time):</td>
        </tr>
        <tr>
            <td class="label">DATA (Date):</td>
            <td class="blank"></td>
        </tr>
    </table>

    <div class="garbage-table">
        <table>
            <thead>
                <tr>
                    <th style="width: 8%;">Número</th>
                    <th style="width: 12%;">Unidade (Kg, Ton, L, m³)</th>
                    <th style="width: 25%;">TIPO DE RESÍDUO (IMO)*</th>
                    <th style="width: 15%;">SOLICITADO (Quant)</th>
                    <th style="width: 15%;">COLETADO (Quant)</th>
                    <th style="width: 25%;">Tanque Armaz.</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td></tr>
                <tr><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td></tr>
                <tr><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td></tr>
                <tr><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td></tr>
                <tr><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td><td class="blank"></td></tr>
            </tbody>
        </table>
    </div>

    <table>
        <tr>
            <td class="label" style="width: 50%;">Método de Transporte (Method of transport):</td>
            <td class="blank" style="width: 50%;"></td>
        </tr>
        <tr>
            <td class="label">Destino do Lixo Retirado (Destinations of garbage removed):</td>
            <td class="blank"></td>
        </tr>
        <tr>
            <td class="label">HORA (Time):</td>
            <td class="blank"></td>
        </tr>
    </table>

        <div class="signature-area">
            <div class="signature-box">
                <p><strong>PRESTADOR DO SERVIÇO (Operational Manager)</strong></p>
                <p class="signature-field">NOME (Name): _________________________________________________</p>
                <p class="signature-field">FUNÇÃO (Function): _________________________________________________</p>
                <p class="signature-field">DATA (Date): _________________________________________________</p>
                <div>
                    <p style="text-align: center; margin-top: 15px; color: #666; font-size: 11px;">Assinatura (Signature)</p>
                </div>
            </div>
            <div class="signature-box">
                <p><strong>AGENTE DE NAVEGAÇÃO (Shipping Agent)</strong></p>
                <div>
                    <p style="text-align: center; margin-top: 20px; color: #666; font-size: 11px;">Assinatura (Signature)</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    // Salvar notas no localStorage
    salvarNotas() {
        localStorage.setItem('notasMaritimas', JSON.stringify(this.notas));
    }

    // Inicializar eventos
    inicializarEventos() {
        document.getElementById('btnNovaNota').addEventListener('click', () => this.criarNovaNota());
        document.getElementById('btnResetar').addEventListener('click', () => this.resetarTemplates());
        document.getElementById('btnSalvar').addEventListener('click', () => this.salvarNotaAtual());
        document.getElementById('btnExcluir').addEventListener('click', () => this.excluirNotaAtual());
        document.getElementById('nomeNota').addEventListener('input', () => this.atualizarNomeNota());
        
        // Inicializar abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.alterarAba(tab);
            });
        });
        
        // Aguardar o editor de template ser criado
        setTimeout(() => {
            const editorTemplate = document.getElementById('editorTemplate');
            if (editorTemplate) {
                editorTemplate.addEventListener('input', () => this.atualizarTemplate());
            }
            
            const btnVisualizar = document.getElementById('btnVisualizar');
            if (btnVisualizar) {
                btnVisualizar.addEventListener('click', () => this.visualizarNota());
            }
            
            const btnImprimir = document.getElementById('btnImprimir');
            if (btnImprimir) {
                btnImprimir.addEventListener('click', () => this.gerarNota());
            }
        }, 100);
    }

    // Alterar entre abas
    alterarAba(tab) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });

        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        if (tab === 'visual') {
            document.getElementById('tabVisual').classList.add('active');
            this.atualizarEditorVisual();
        } else if (tab === 'editor') {
            document.getElementById('tabEditor').classList.add('active');
        } else if (tab === 'preview') {
            document.getElementById('tabPreview').classList.add('active');
            this.atualizarPreview();
        }
    }

    // Renderizar lista de notas
    renderizarLista() {
        const lista = document.getElementById('listaNotas');
        lista.innerHTML = '';

        if (this.notas.length === 0) {
            lista.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">Nenhuma nota criada ainda</li>';
            return;
        }

        this.notas.forEach(nota => {
            const item = document.createElement('li');
            item.className = 'item-nota';
            if (this.notaAtual && this.notaAtual.id === nota.id) {
                item.classList.add('ativo');
            }

            const preview = nota.template ? 'Template HTML' : (nota.conteudo ? nota.conteudo.substring(0, 50) + '...' : 'Sem conteúdo');
            item.innerHTML = `
                <div class="item-nota-titulo">${nota.nome}</div>
                <div class="item-nota-preview">${preview}</div>
            `;

            item.addEventListener('click', () => this.selecionarNota(nota.id));
            lista.appendChild(item);
        });
    }

    // Selecionar uma nota para edição
    selecionarNota(id) {
        const nota = this.notas.find(n => n.id === id);
        if (!nota) return;

        this.notaAtual = { ...nota };
        this.exibirEditor();
        this.preencherEditor();
        this.renderizarLista();
    }

    // Criar nova nota
    criarNovaNota() {
        const novoId = this.notas.length > 0 ? Math.max(...this.notas.map(n => n.id)) + 1 : 1;
        const novaNota = {
            id: novoId,
            nome: 'Nova Nota',
            template: '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { font-family: Arial, sans-serif; margin: 20px; }</style></head><body><h1>Nova Nota</h1><p>Edite este template para criar sua nota personalizada.</p></body></html>'
        };

        this.notas.push(novaNota);
        this.salvarNotas();
        this.selecionarNota(novoId);
    }

    // Exibir editor
    exibirEditor() {
        document.getElementById('editorVazio').style.display = 'none';
        document.getElementById('editorNota').style.display = 'flex';
    }

    // Ocultar editor
    ocultarEditor() {
        document.getElementById('editorVazio').style.display = 'flex';
        document.getElementById('editorNota').style.display = 'none';
    }

    // Preencher campos do editor
    preencherEditor() {
        if (!this.notaAtual) return;

        document.getElementById('nomeNota').value = this.notaAtual.nome;
        const editor = document.getElementById('editorTemplate');
        if (editor) {
            editor.value = this.notaAtual.template || '';
        }
        this.atualizarEditorVisual();
        this.atualizarPreview();
    }

    // Atualizar nome da nota
    atualizarNomeNota() {
        if (this.notaAtual) {
            this.notaAtual.nome = document.getElementById('nomeNota').value;
        }
    }

    // Atualizar template da nota
    atualizarTemplate() {
        if (this.notaAtual) {
            const editor = document.getElementById('editorTemplate');
            if (editor) {
                this.notaAtual.template = editor.value;
                this.atualizarPreview();
            }
        }
    }

    // Função auxiliar para extrair valor de campo .blank após um label
    extrairValorCampo(body, labelText) {
        const labels = body.querySelectorAll('.label');
        for (let label of labels) {
            if (label.textContent.includes(labelText)) {
                // Buscar o próximo .blank na mesma linha ou próxima linha
                const row = label.closest('tr');
                if (row) {
                    const blank = row.querySelector('.blank');
                    if (blank) {
                        return blank.textContent.trim();
                    }
                }
                // Se não encontrar na mesma linha, buscar na próxima
                const nextRow = row?.nextElementSibling;
                if (nextRow) {
                    const blank = nextRow.querySelector('.blank');
                    if (blank) {
                        return blank.textContent.trim();
                    }
                }
            }
        }
        return '';
    }

    // Função auxiliar para extrair todos os campos de uma tabela
    extrairCamposTabela(body, tabelaIndex) {
        const tabelas = body.querySelectorAll('table');
        if (tabelaIndex >= tabelas.length) return {};
        
        const tabela = tabelas[tabelaIndex];
        const campos = {};
        const linhas = tabela.querySelectorAll('tr');
        
        linhas.forEach(linha => {
            const label = linha.querySelector('.label');
            const blank = linha.querySelector('.blank');
            
            if (label && blank) {
                const labelText = label.textContent.trim();
                const valor = blank.textContent.trim();
                // Criar chave única baseada no texto do label
                const chave = labelText.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 30);
                campos[chave] = { label: labelText, valor: valor };
            }
        });
        
        return campos;
    }

    // Extrair dados editáveis do template HTML
    extrairDadosTemplate(template) {
        if (!template) {
            console.warn('⚠️ EDITOR VISUAL: Template vazio');
            return null;
        }
        
        console.log('🔍 EDITOR VISUAL: Extraindo dados do template...');
        const dados = {};
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, 'text/html');
        const body = doc.body || doc.querySelector('body');
        
        if (!body) {
            console.warn('⚠️ EDITOR VISUAL: Body não encontrado');
            return null;
        }
        
        // Extrair informações da empresa
        const empresaNome = body.querySelector('h1');
        if (empresaNome) {
            dados.empresaNome = empresaNome.textContent.trim();
        }
        
        const empresaInfo = body.querySelectorAll('td[style*="width: 75%"] p, td[width="75%"] p');
        if (empresaInfo.length > 0) {
            dados.empresaEndereco = empresaInfo[0]?.textContent.trim() || '';
            dados.empresaCidade = empresaInfo[1]?.textContent.trim() || '';
            dados.empresaTelefone = empresaInfo[2]?.textContent.trim() || '';
            dados.empresaContato = empresaInfo[3]?.textContent.trim() || '';
        }
        
        // Extrair título do documento
        const titulo = body.querySelector('td[colspan="2"] div[style*="font-size: 14px"]');
        if (titulo) {
            dados.tituloDocumento = titulo.textContent.trim();
        }
        
        // Extrair instruções (CFN)
        const instrucoes = body.querySelector('td[colspan="2"] p[style*="font-size: 9px"]');
        if (instrucoes) {
            dados.instrucoes = instrucoes.textContent.trim();
        }
        
        // Extrair todos os labels (textos fixos que podem ser editados)
        const tabelas = body.querySelectorAll('table');
        tabelas.forEach((tabela, index) => {
            if (index === 0) return; // Pular a primeira tabela (header)
            
            const linhas = tabela.querySelectorAll('tr');
            linhas.forEach((linha, linhaIndex) => {
                const labels = linha.querySelectorAll('.label');
                
                labels.forEach((label, labelIndex) => {
                    const labelText = label.textContent.trim();
                    if (labelText) {
                        const chave = `label_${index}_${linhaIndex}_${labelIndex}_${labelText.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20)}`;
                        dados[chave] = {
                            label: labelText,
                            tabelaIndex: index,
                            linhaIndex: linhaIndex,
                            labelIndex: labelIndex,
                            tipo: 'label'
                        };
                    }
                });
            });
        });
        
        // Extrair textos fixos do rodapé (CFN)
        const footer = body.querySelector('.footer');
        if (footer) {
            const footerParas = footer.querySelectorAll('p');
            footerParas.forEach((para, index) => {
                const texto = para.textContent.trim();
                if (texto) {
                    dados[`footer_${index}`] = {
                        texto: texto,
                        tipo: 'footer',
                        index: index
                    };
                }
            });
        }
        
        // Extrair cabeçalhos de tabelas (th)
        const ths = body.querySelectorAll('th');
        ths.forEach((th, index) => {
            const texto = th.textContent.trim();
            if (texto) {
                dados[`th_${index}`] = {
                    texto: texto,
                    tipo: 'th',
                    index: index
                };
            }
        });
        
        console.log('✅ EDITOR VISUAL: Dados extraídos:', Object.keys(dados).length, 'campos');
        return dados;
    }

    // Atualizar editor visual com formulário
    atualizarEditorVisual() {
        console.log('🔍 EDITOR VISUAL: Atualizando interface do editor visual...');
        
        if (!this.notaAtual || !this.notaAtual.template) {
            console.warn('⚠️ EDITOR VISUAL: Nota atual ou template não encontrado');
            const editorVisual = document.getElementById('editorVisual');
            if (editorVisual) {
                editorVisual.innerHTML = '<p style="padding: 20px; color: #999;">Nenhum template disponível para edição visual.</p>';
            }
            return;
        }
        
        const dados = this.extrairDadosTemplate(this.notaAtual.template);
        const editorVisual = document.getElementById('editorVisual');
        if (!editorVisual) {
            console.error('❌ EDITOR VISUAL: Elemento editorVisual não encontrado no DOM');
            return;
        }
        
        const isCFN = this.notaAtual.nome && this.notaAtual.nome.includes('CFN');
        const isCertificado = this.notaAtual.nome && this.notaAtual.nome.includes('Certificado');
        
        let html = '<div class="visual-editor-form">';
        
        // Seção: Informações da Empresa
        html += '<div class="form-section">';
        html += '<h3>📋 Informações da Empresa</h3>';
        html += '<div class="form-group">';
        html += '<label>Nome da Empresa:</label>';
        html += `<input type="text" id="visual-empresaNome" class="form-input" value="${(dados?.empresaNome || '').replace(/"/g, '&quot;')}" placeholder="Ex: SEVEN NAVEGAÇÃO LTDA">`;
        html += '</div>';
        
        html += '<div class="form-group">';
        html += '<label>Endereço:</label>';
        html += `<input type="text" id="visual-empresaEndereco" class="form-input" value="${(dados?.empresaEndereco || '').replace(/"/g, '&quot;')}" placeholder="Ex: Av. Dos Holandeses, Ed. tech Office...">`;
        html += '</div>';
        
        html += '<div class="form-group">';
        html += '<label>Cidade/Estado/CEP:</label>';
        html += `<input type="text" id="visual-empresaCidade" class="form-input" value="${(dados?.empresaCidade || '').replace(/"/g, '&quot;')}" placeholder="Ex: São Luís - MA - CEP: 65.077-357">`;
        html += '</div>';
        
        html += '<div class="form-group">';
        html += '<label>Telefone:</label>';
        html += `<input type="text" id="visual-empresaTelefone" class="form-input" value="${(dados?.empresaTelefone || '').replace(/"/g, '&quot;')}" placeholder="Ex: Fone: 98 99117-1988 e 99161-5880">`;
        html += '</div>';
        
        html += '<div class="form-group">';
        html += '<label>Website/E-mail:</label>';
        html += `<input type="text" id="visual-empresaContato" class="form-input" value="${(dados?.empresaContato || '').replace(/"/g, '&quot;')}" placeholder="Ex: www.sevennav.com.br | recepcao.apoioportuario@gmail.com">`;
        html += '</div>';
        
        html += '</div>';
        
        // Seção: Título do Documento
        html += '<div class="form-section">';
        html += '<h3>📄 Título do Documento</h3>';
        html += '<div class="form-group">';
        html += '<label>Título:</label>';
        html += `<input type="text" id="visual-tituloDocumento" class="form-input" value="${(dados?.tituloDocumento || '').replace(/"/g, '&quot;')}" placeholder="Ex: Comprovante de Fornecimento a Navio - CFN">`;
        html += '</div>';
        
        if (isCFN) {
            html += '<div class="form-group">';
            html += '<label>Instruções:</label>';
            html += `<textarea id="visual-instrucoes" class="form-textarea" rows="2" placeholder="Ex: Preencher com letras de forma - NÃO RASURAR">${(dados?.instrucoes || '').replace(/"/g, '&quot;')}</textarea>`;
            html += '</div>';
        }
        
        html += '</div>';
        
        // Seção: Labels dos Campos (textos fixos que aparecem antes dos campos em branco)
        const labelsExtras = Object.keys(dados).filter(k => k.startsWith('label_'));
        if (labelsExtras.length > 0) {
            html += '<div class="form-section">';
            html += '<h3>🏷️ Labels dos Campos</h3>';
            html += '<p style="font-size: 12px; color: #666; margin-bottom: 10px;">Edite os textos que aparecem antes dos campos em branco</p>';
            html += '<div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">';
            
            // Agrupar labels por tabela
            const labelsPorTabela = {};
            labelsExtras.forEach(chave => {
                const campo = dados[chave];
                if (campo && campo.label) {
                    const tabelaIndex = campo.tabelaIndex;
                    if (!labelsPorTabela[tabelaIndex]) {
                        labelsPorTabela[tabelaIndex] = [];
                    }
                    labelsPorTabela[tabelaIndex].push({ chave, campo });
                }
            });
            
            // Renderizar por tabela
            Object.keys(labelsPorTabela).sort((a, b) => a - b).forEach(tabelaIndex => {
                html += `<div style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 4px;">`;
                html += `<h4 style="margin: 0 0 10px 0; font-size: 14px; color: #1d1b78;">Tabela ${parseInt(tabelaIndex)}</h4>`;
                
                labelsPorTabela[tabelaIndex].forEach(({ chave, campo }) => {
                    html += '<div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">';
                    html += `<input type="text" id="${chave}" class="form-input" value="${(campo.label || '').replace(/"/g, '&quot;')}" placeholder="Ex: Nome do Navio (Ship's name)" style="flex: 1;">`;
                    html += `<button type="button" class="btn-remover-label" data-chave="${chave}" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️</button>`;
                    html += '</div>';
                });
                
                html += `<button type="button" class="btn-adicionar-label" data-tabela="${tabelaIndex}" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 8px;">➕ Adicionar Label</button>`;
                html += `</div>`;
            });
            
            html += '</div>';
            html += '</div>';
        }
        
        // Botão para adicionar nova tabela
        html += '<div class="form-section">';
        html += '<h3>📋 Gerenciar Tabelas</h3>';
        html += '<button type="button" id="btnAdicionarTabela" class="btn btn-primary" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">➕ Adicionar Nova Tabela</button>';
        html += '</div>';
        
        // Seção: Cabeçalhos de Tabelas
        const thsExtras = Object.keys(dados).filter(k => k.startsWith('th_'));
        if (thsExtras.length > 0) {
            html += '<div class="form-section">';
            html += '<h3>📊 Cabeçalhos de Tabelas</h3>';
            html += '<div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">';
            
            thsExtras.forEach(chave => {
                const campo = dados[chave];
                if (campo && campo.texto) {
                    html += '<div class="form-group">';
                    html += `<label>Cabeçalho:</label>`;
                    html += `<input type="text" id="${chave}" class="form-input" value="${(campo.texto || '').replace(/"/g, '&quot;')}">`;
                    html += '</div>';
                }
            });
            
            html += '</div>';
            html += '</div>';
        }
        
        // Seção: Rodapé (CFN)
        const footerExtras = Object.keys(dados).filter(k => k.startsWith('footer_'));
        if (footerExtras.length > 0) {
            html += '<div class="form-section">';
            html += '<h3>📄 Rodapé</h3>';
            html += '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">';
            
            footerExtras.forEach(chave => {
                const campo = dados[chave];
                if (campo && campo.texto) {
                    html += '<div class="form-group">';
                    html += `<label>Texto do Rodapé:</label>`;
                    html += `<textarea id="${chave}" class="form-textarea" rows="2">${(campo.texto || '').replace(/"/g, '&quot;')}</textarea>`;
                    html += '</div>';
                }
            });
            
            html += '</div>';
            html += '</div>';
        }
        
        html += '<div class="form-actions">';
        html += '<button id="btnAplicarVisual" class="btn btn-success">✅ Aplicar Alterações</button>';
        html += '</div>';
        
        html += '</div>';
        
        editorVisual.innerHTML = html;
        
        // Adicionar eventos aos botões (usar setTimeout para garantir que o DOM foi atualizado)
        setTimeout(() => {
            const btnAplicar = document.getElementById('btnAplicarVisual');
            if (btnAplicar) {
                console.log('✅ EDITOR VISUAL: Botão "Aplicar Alterações" encontrado e evento adicionado');
                btnAplicar.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🔍 EDITOR VISUAL: Botão clicado - aplicando alterações...');
                    this.aplicarAlteracoesVisuais();
                });
            } else {
                console.error('❌ EDITOR VISUAL: Botão "Aplicar Alterações" não encontrado no DOM');
            }
            
            // Eventos para remover labels
            const editorVisual = document.getElementById('editorVisual');
            if (editorVisual) {
                editorVisual.querySelectorAll('.btn-remover-label').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const chave = e.target.getAttribute('data-chave');
                        this.removerLabel(chave);
                    });
                });
                
                // Eventos para adicionar labels
                editorVisual.querySelectorAll('.btn-adicionar-label').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tabelaIndex = e.target.getAttribute('data-tabela');
                        this.adicionarLabel(tabelaIndex);
                    });
                });
            }
            
            // Evento para adicionar nova tabela
            const btnAdicionarTabela = document.getElementById('btnAdicionarTabela');
            if (btnAdicionarTabela) {
                btnAdicionarTabela.addEventListener('click', () => {
                    this.adicionarNovaTabela();
                });
            }
        }, 100);
        
        // Adicionar eventos de input para atualização automática com debounce
        const inputs = editorVisual.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Debounce: aguardar 500ms após parar de digitar antes de aplicar
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.aplicarAlteracoesVisuais();
                }, 500);
            });
        });
        
        console.log('✅ EDITOR VISUAL: Interface do editor visual atualizada com sucesso');
    }

    // Aplicar alterações do editor visual ao template
    aplicarAlteracoesVisuais() {
        console.log('🔍 EDITOR VISUAL: Iniciando aplicação de alterações...');
        
        if (!this.notaAtual || !this.notaAtual.template) {
            console.warn('⚠️ EDITOR VISUAL: Nota atual ou template não encontrado');
            return;
        }
        
        let template = this.notaAtual.template;
        const isCFN = this.notaAtual.nome && this.notaAtual.nome.includes('CFN');
        const isCertificado = this.notaAtual.nome && this.notaAtual.nome.includes('Certificado');
        
        console.log('🔍 EDITOR VISUAL: Tipo de nota:', isCFN ? 'CFN' : (isCertificado ? 'Certificado' : 'Outro'));
        
        // Obter valores dos campos
        const empresaNome = document.getElementById('visual-empresaNome')?.value || '';
        const empresaEndereco = document.getElementById('visual-empresaEndereco')?.value || '';
        const empresaCidade = document.getElementById('visual-empresaCidade')?.value || '';
        const empresaTelefone = document.getElementById('visual-empresaTelefone')?.value || '';
        const empresaContato = document.getElementById('visual-empresaContato')?.value || '';
        const tituloDocumento = document.getElementById('visual-tituloDocumento')?.value || '';
        const instrucoes = document.getElementById('visual-instrucoes')?.value || '';
        
        console.log('🔍 EDITOR VISUAL: Valores capturados:', {
            empresaNome,
            empresaEndereco,
            empresaCidade,
            empresaTelefone,
            empresaContato,
            tituloDocumento,
            instrucoes
        });
        
        // Usar DOMParser para manipular o HTML de forma mais segura
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, 'text/html');
        const body = doc.body || doc.querySelector('body');
        
        if (!body) {
            console.error('❌ EDITOR VISUAL: Body não encontrado no documento');
            return;
        }
        
        if (isCFN) {
            console.log('🔍 EDITOR VISUAL: Processando template CFN...');
            // Atualizar nome da empresa (h1 dentro da tabela do header)
            const h1 = body.querySelector('td[width="75%"] h1');
            if (h1) {
                console.log('✅ EDITOR VISUAL: Atualizando h1 (nome empresa)');
                h1.textContent = empresaNome;
            } else {
                console.warn('⚠️ EDITOR VISUAL: h1 não encontrado no template CFN');
            }
            
            // Atualizar parágrafos de informação da empresa
            const infoParas = body.querySelectorAll('td[width="75%"] p');
            console.log('🔍 EDITOR VISUAL: Encontrados', infoParas.length, 'parágrafos de informação');
            if (infoParas.length >= 1 && empresaEndereco) {
                infoParas[0].textContent = empresaEndereco;
                console.log('✅ EDITOR VISUAL: Endereço atualizado');
            }
            if (infoParas.length >= 2 && empresaCidade) {
                infoParas[1].textContent = empresaCidade;
                console.log('✅ EDITOR VISUAL: Cidade atualizada');
            }
            if (infoParas.length >= 3 && empresaTelefone) {
                infoParas[2].textContent = empresaTelefone;
                console.log('✅ EDITOR VISUAL: Telefone atualizado');
            }
            if (infoParas.length >= 4 && empresaContato) {
                infoParas[3].textContent = empresaContato;
                console.log('✅ EDITOR VISUAL: Contato atualizado');
            }
            
            // Atualizar título do documento
            const tituloDiv = body.querySelector('td[colspan="2"] div[style*="font-size: 14px"]');
            if (tituloDiv && tituloDocumento) {
                tituloDiv.textContent = tituloDocumento;
                console.log('✅ EDITOR VISUAL: Título do documento atualizado');
            } else {
                console.warn('⚠️ EDITOR VISUAL: Título div não encontrado');
            }
            
            // Atualizar instruções
            const instrucoesP = body.querySelector('td[colspan="2"] p[style*="font-size: 9px"]');
            if (instrucoesP && instrucoes) {
                instrucoesP.innerHTML = instrucoes.replace(/\n/g, '<br>');
                console.log('✅ EDITOR VISUAL: Instruções atualizadas');
            }
        } else if (isCertificado) {
            console.log('🔍 EDITOR VISUAL: Processando template Certificado...');
            
            // Buscar a primeira tabela (header)
            const firstTable = body.querySelector('table');
            if (!firstTable) {
                console.error('❌ EDITOR VISUAL: Primeira tabela não encontrada');
            } else {
                // Atualizar nome da empresa (h1 dentro da tabela do header)
                // Buscar td com style width="75%" ou width="75%"
                const td75 = firstTable.querySelector('td[style*="width: 75%"]') || firstTable.querySelector('td[width="75%"]');
                if (!td75) {
                    // Tentar buscar pela segunda td da primeira linha
                    const firstRow = firstTable.querySelector('tr');
                    if (firstRow) {
                        const tds = firstRow.querySelectorAll('td');
                        if (tds.length >= 2) {
                            const td75Alt = tds[1]; // Segunda td (índice 1)
                            console.log('✅ EDITOR VISUAL: Usando segunda td da primeira linha');
                            
                            // Atualizar h1
                            const h1 = td75Alt.querySelector('h1');
                            if (h1) {
                                h1.textContent = empresaNome;
                                console.log('✅ EDITOR VISUAL: Atualizando h1 (nome empresa)');
                            }
                            
                            // Atualizar parágrafos
                            const infoParas = td75Alt.querySelectorAll('p');
                            console.log('🔍 EDITOR VISUAL: Encontrados', infoParas.length, 'parágrafos de informação');
                            if (infoParas.length >= 1 && empresaEndereco) {
                                infoParas[0].textContent = empresaEndereco;
                                console.log('✅ EDITOR VISUAL: Endereço atualizado');
                            }
                            if (infoParas.length >= 2 && empresaCidade) {
                                infoParas[1].textContent = empresaCidade;
                                console.log('✅ EDITOR VISUAL: Cidade atualizada');
                            }
                            if (infoParas.length >= 3 && empresaTelefone) {
                                infoParas[2].textContent = empresaTelefone;
                                console.log('✅ EDITOR VISUAL: Telefone atualizado');
                            }
                            if (infoParas.length >= 4 && empresaContato) {
                                infoParas[3].textContent = empresaContato;
                                console.log('✅ EDITOR VISUAL: Contato atualizado');
                            }
                        }
                    }
                } else {
                    // Atualizar nome da empresa (h1 dentro da tabela do header)
                    const h1 = td75.querySelector('h1');
                    if (h1) {
                        console.log('✅ EDITOR VISUAL: Atualizando h1 (nome empresa)');
                        h1.textContent = empresaNome;
                    } else {
                        console.warn('⚠️ EDITOR VISUAL: h1 não encontrado no template Certificado');
                    }
                    
                    // Atualizar parágrafos de informação da empresa
                    const infoParas = td75.querySelectorAll('p');
                    console.log('🔍 EDITOR VISUAL: Encontrados', infoParas.length, 'parágrafos de informação');
                    if (infoParas.length >= 1 && empresaEndereco) {
                        infoParas[0].textContent = empresaEndereco;
                        console.log('✅ EDITOR VISUAL: Endereço atualizado');
                    }
                    if (infoParas.length >= 2 && empresaCidade) {
                        infoParas[1].textContent = empresaCidade;
                        console.log('✅ EDITOR VISUAL: Cidade atualizada');
                    }
                    if (infoParas.length >= 3 && empresaTelefone) {
                        infoParas[2].textContent = empresaTelefone;
                        console.log('✅ EDITOR VISUAL: Telefone atualizado');
                    }
                    if (infoParas.length >= 4 && empresaContato) {
                        infoParas[3].textContent = empresaContato;
                        console.log('✅ EDITOR VISUAL: Contato atualizado');
                    }
                }
            }
            
            // Atualizar título do documento (na segunda linha da primeira tabela)
            const tituloDiv = body.querySelector('td[colspan="2"] div[style*="font-size: 14px"]');
            if (tituloDiv && tituloDocumento) {
                tituloDiv.textContent = tituloDocumento;
                console.log('✅ EDITOR VISUAL: Título do documento atualizado');
            } else {
                console.warn('⚠️ EDITOR VISUAL: Título div não encontrado');
            }
        }
        
        // Atualizar todos os labels (textos fixos)
        const tabelas = body.querySelectorAll('table');
        tabelas.forEach((tabela, tabelaIndex) => {
            if (tabelaIndex === 0) return; // Pular a primeira tabela (header)
            
            const linhas = tabela.querySelectorAll('tr');
            linhas.forEach((linha, linhaIndex) => {
                const labels = linha.querySelectorAll('.label');
                
                labels.forEach((label, labelIndex) => {
                    const labelTextOriginal = label.textContent.trim();
                    if (labelTextOriginal) {
                        const chave = `label_${tabelaIndex}_${linhaIndex}_${labelIndex}_${labelTextOriginal.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20)}`;
                        const input = document.getElementById(chave);
                        
                        if (input && input.value) {
                            label.textContent = input.value;
                            console.log(`✅ EDITOR VISUAL: Label atualizado`);
                        }
                    }
                });
            });
        });
        
        // Atualizar cabeçalhos de tabelas (th)
        const ths = body.querySelectorAll('th');
        ths.forEach((th, index) => {
            const chave = `th_${index}`;
            const input = document.getElementById(chave);
            
            if (input && input.value) {
                th.textContent = input.value;
                console.log(`✅ EDITOR VISUAL: Cabeçalho de tabela atualizado`);
            }
        });
        
        // Atualizar rodapé (CFN)
        const footer = body.querySelector('.footer');
        if (footer) {
            const footerParas = footer.querySelectorAll('p');
            footerParas.forEach((para, index) => {
                const chave = `footer_${index}`;
                const input = document.getElementById(chave);
                
                if (input && input.value) {
                    para.textContent = input.value;
                    console.log(`✅ EDITOR VISUAL: Texto do rodapé atualizado`);
                }
            });
        }
        
        // Converter de volta para string HTML
        template = doc.documentElement.outerHTML;
        
        // Atualizar template e preview
        this.notaAtual.template = template;
        const editor = document.getElementById('editorTemplate');
        if (editor) {
            editor.value = template;
        }
        
        console.log('✅ EDITOR VISUAL: Alterações aplicadas com sucesso! Template atualizado.');
        this.atualizarPreview();
    }

    // Remover um label do template
    removerLabel(chave) {
        if (!this.notaAtual || !this.notaAtual.template) return;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.notaAtual.template, 'text/html');
        const body = doc.body || doc.querySelector('body');
        if (!body) return;
        
        // Extrair informações da chave
        const partes = chave.split('_');
        if (partes.length < 4) return;
        
        const tabelaIndex = parseInt(partes[1]);
        const linhaIndex = parseInt(partes[2]);
        const labelIndex = parseInt(partes[3]);
        
        const tabelas = body.querySelectorAll('table');
        if (tabelaIndex >= tabelas.length) return;
        
        const tabela = tabelas[tabelaIndex];
        const linhas = tabela.querySelectorAll('tr');
        if (linhaIndex >= linhas.length) return;
        
        const linha = linhas[linhaIndex];
        const labels = linha.querySelectorAll('.label');
        if (labelIndex >= labels.length) return;
        
        const label = labels[labelIndex];
        const blank = linha.querySelector('.blank');
        
        // Remover a linha inteira se só tiver esse label, ou remover apenas o label e blank
        if (labels.length === 1 && linha.querySelectorAll('.blank').length <= 1) {
            linha.remove();
        } else {
            // Remover label e blank correspondente
            label.remove();
            if (blank) blank.remove();
        }
        
        // Atualizar template
        this.notaAtual.template = doc.documentElement.outerHTML;
        const editor = document.getElementById('editorTemplate');
        if (editor) {
            editor.value = this.notaAtual.template;
        }
        
        // Recarregar editor visual
        this.atualizarEditorVisual();
        this.atualizarPreview();
    }
    
    // Remover um label do template
    removerLabel(chave) {
        if (!this.notaAtual || !this.notaAtual.template) return;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.notaAtual.template, 'text/html');
        const body = doc.body || doc.querySelector('body');
        if (!body) return;
        
        // Extrair informações da chave
        const partes = chave.split('_');
        if (partes.length < 4) return;
        
        const tabelaIndex = parseInt(partes[1]);
        const linhaIndex = parseInt(partes[2]);
        const labelIndex = parseInt(partes[3]);
        
        const tabelas = body.querySelectorAll('table');
        if (tabelaIndex >= tabelas.length) return;
        
        const tabela = tabelas[tabelaIndex];
        const linhas = tabela.querySelectorAll('tr');
        if (linhaIndex >= linhas.length) return;
        
        const linha = linhas[linhaIndex];
        const labels = linha.querySelectorAll('.label');
        if (labelIndex >= labels.length) return;
        
        const label = labels[labelIndex];
        const blank = linha.querySelector('.blank');
        
        // Remover a linha inteira se só tiver esse label, ou remover apenas o label e blank
        if (labels.length === 1 && linha.querySelectorAll('.blank').length <= 1) {
            linha.remove();
        } else {
            // Remover label e blank correspondente
            label.remove();
            if (blank) blank.remove();
        }
        
        // Atualizar template
        this.notaAtual.template = doc.documentElement.outerHTML;
        const editor = document.getElementById('editorTemplate');
        if (editor) {
            editor.value = this.notaAtual.template;
        }
        
        // Recarregar editor visual
        this.atualizarEditorVisual();
        this.atualizarPreview();
    }
    
    // Adicionar um novo label em uma tabela existente
    adicionarLabel(tabelaIndex) {
        if (!this.notaAtual || !this.notaAtual.template) return;
        
        const novoLabel = prompt('Digite o texto do novo label:');
        if (!novoLabel || novoLabel.trim() === '') return;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.notaAtual.template, 'text/html');
        const body = doc.body || doc.querySelector('body');
        if (!body) return;
        
        const tabelaIndexNum = parseInt(tabelaIndex);
        const tabelas = body.querySelectorAll('table');
        if (tabelaIndexNum >= tabelas.length) return;
        
        const tabela = tabelas[tabelaIndexNum];
        
        // Criar nova linha com label e blank
        const novaLinha = doc.createElement('tr');
        novaLinha.innerHTML = `
            <td class="label" style="width: 50%;">${this.escapeHtml(novoLabel)}</td>
            <td class="blank" style="width: 50%;"></td>
        `;
        
        // Adicionar ao final da tabela
        tabela.appendChild(novaLinha);
        
        // Atualizar template
        this.notaAtual.template = doc.documentElement.outerHTML;
        const editor = document.getElementById('editorTemplate');
        if (editor) {
            editor.value = this.notaAtual.template;
        }
        
        // Recarregar editor visual
        this.atualizarEditorVisual();
        this.atualizarPreview();
    }
    
    // Adicionar uma nova tabela ao template
    adicionarNovaTabela() {
        if (!this.notaAtual || !this.notaAtual.template) return;
        
        const numLabels = prompt('Quantos labels/campos deseja na nova tabela?', '2');
        if (!numLabels || isNaN(numLabels) || parseInt(numLabels) < 1) return;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.notaAtual.template, 'text/html');
        const body = doc.body || doc.querySelector('body');
        if (!body) return;
        
        // Criar nova tabela
        const novaTabela = doc.createElement('table');
        novaTabela.style.margin = '8px 0';
        novaTabela.style.fontSize = '13px';
        novaTabela.style.border = '1px solid #1d1b78';
        
        for (let i = 0; i < parseInt(numLabels); i++) {
            const linha = doc.createElement('tr');
            linha.innerHTML = `
                <td class="label" style="width: 50%;">Novo Label ${i + 1}</td>
                <td class="blank" style="width: 50%;"></td>
            `;
            novaTabela.appendChild(linha);
        }
        
        // Adicionar antes da área de assinatura ou no final
        const signatureArea = body.querySelector('.signature-area');
        const footer = body.querySelector('.footer');
        const container = body.querySelector('.document-container');
        
        if (signatureArea) {
            container.insertBefore(novaTabela, signatureArea);
        } else if (footer) {
            container.insertBefore(novaTabela, footer);
        } else {
            container.appendChild(novaTabela);
        }
        
        // Atualizar template
        this.notaAtual.template = doc.documentElement.outerHTML;
        const editor = document.getElementById('editorTemplate');
        if (editor) {
            editor.value = this.notaAtual.template;
        }
        
        // Recarregar editor visual
        this.atualizarEditorVisual();
        this.atualizarPreview();
    }
    
    // Escapar HTML para evitar XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Corrigir caminhos de imagens no template para funcionar no iframe
    corrigirCaminhosTemplate(template) {
        if (!template) return template;
        
        // Obter a URL base da página atual
        let baseUrl = window.location.origin;
        const pathParts = window.location.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
            // Remover o nome do arquivo (index.html) e manter apenas o diretório
            pathParts.pop();
            if (pathParts.length > 0) {
                baseUrl += '/' + pathParts.join('/') + '/';
            } else {
                baseUrl += '/';
            }
        } else {
            baseUrl += '/';
        }
        
        // Substituir caminhos relativos de imagens por absolutos
        template = template.replace(
            /src="assets\//g, 
            `src="${baseUrl}assets/`
        );
        
        // Também substituir ../assets/ caso exista
        template = template.replace(
            /src="\.\.\/assets\//g, 
            `src="${baseUrl}assets/`
        );
        
        return template;
    }

    // Atualizar preview
    atualizarPreview() {
        const preview = document.getElementById('previewNota');
        if (!preview || !this.notaAtual) {
            return;
        }
        
        // Tentar usar template, se não tiver, usar conteudo convertido
        let template = this.notaAtual.template;
        if (!template && this.notaAtual.conteudo) {
            template = this.converterTextoParaHTML(this.notaAtual.conteudo);
        }
        
        if (template) {
            // Corrigir caminhos antes de renderizar
            template = this.corrigirCaminhosTemplate(template);
            preview.srcdoc = template;
        } else {
            preview.srcdoc = '<html><body><p style="padding: 20px; color: #999;">Nenhum template disponível. Edite a nota para adicionar conteúdo.</p></body></html>';
        }
    }

    // Salvar nota atual
    salvarNotaAtual() {
        if (!this.notaAtual) return;

        const index = this.notas.findIndex(n => n.id === this.notaAtual.id);
        if (index !== -1) {
            this.notas[index] = { ...this.notaAtual };
            this.salvarNotas();
            this.renderizarLista();
            
            // Feedback visual
            const btn = document.getElementById('btnSalvar');
            const textoOriginal = btn.textContent;
            btn.textContent = '✓ Salvo!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = textoOriginal;
                btn.style.background = '';
            }, 2000);
        }
    }

    // Gerar PDF/Imprimir nota
    gerarNota() {
        if (!this.notaAtual) return;
        
        // Tentar usar template, se não tiver, usar conteudo convertido
        let template = this.notaAtual.template;
        if (!template && this.notaAtual.conteudo) {
            template = this.converterTextoParaHTML(this.notaAtual.conteudo);
        }
        if (!template) {
            alert('Esta nota não possui template. Edite a nota primeiro.');
            return;
        }
        
        // Corrigir caminhos antes de abrir
        template = this.corrigirCaminhosTemplate(template);
        
        const novaJanela = window.open('', '_blank');
        novaJanela.document.write(template);
        novaJanela.document.close();
        setTimeout(() => {
            novaJanela.print();
        }, 500);
    }

    // Visualizar nota em nova aba
    visualizarNota() {
        if (!this.notaAtual) return;
        
        // Se não tiver template, tentar usar conteudo ou criar um básico
        let template = this.notaAtual.template;
        if (!template && this.notaAtual.conteudo) {
            template = this.converterTextoParaHTML(this.notaAtual.conteudo);
        }
        if (!template) {
            alert('Esta nota não possui template. Edite a nota primeiro.');
            return;
        }
        
        // Corrigir caminhos antes de abrir
        template = this.corrigirCaminhosTemplate(template);
        
        const novaJanela = window.open('', '_blank');
        novaJanela.document.write(template);
        novaJanela.document.close();
    }

    // Resetar templates para os padrões
    resetarTemplates() {
        if (confirm('Isso irá substituir todas as notas pelos templates padrão. Deseja continuar?')) {
            localStorage.removeItem('notasMaritimas');
            this.notas = [
                {
                    id: 1,
                    nome: 'Comprovante de Fornecimento a Navio - CFN',
                    template: this.getTemplateCFN()
                },
                {
                    id: 2,
                    nome: 'Certificado de Retirada de Resíduo',
                    template: this.getTemplateCertificadoResiduo()
                }
            ];
            this.salvarNotas();
            this.notaAtual = null;
            this.ocultarEditor();
            this.renderizarLista();
            alert('Templates resetados com sucesso!');
        }
    }

    // Excluir nota atual
    excluirNotaAtual() {
        if (!this.notaAtual) return;

        if (confirm(`Tem certeza que deseja excluir a nota "${this.notaAtual.nome}"?`)) {
            this.notas = this.notas.filter(n => n.id !== this.notaAtual.id);
            this.salvarNotas();
            this.notaAtual = null;
            this.ocultarEditor();
            this.renderizarLista();
        }
    }
}

// Verificar e corrigir logo no header
function verificarLogo() {
    const logo = document.querySelector('.logo');
    if (logo) {
        // Verificar se a imagem carregou
        logo.addEventListener('error', function() {
            console.error('❌ Logo não encontrada no caminho:', this.src);
            // Tentar caminho alternativo
            const caminhoAtual = this.src;
            const caminhoAlternativo = caminhoAtual.replace('assets/logo/', './assets/logo/');
            if (caminhoAtual !== caminhoAlternativo) {
                console.log('🔄 Tentando caminho alternativo:', caminhoAlternativo);
                this.src = caminhoAlternativo;
            }
        });
        
        logo.addEventListener('load', function() {
            console.log('✅ Logo carregada com sucesso:', this.src);
            this.style.opacity = '1';
        });
        
        // Verificar se já está carregada
        if (logo.complete && logo.naturalHeight !== 0) {
            console.log('✅ Logo já estava carregada');
            logo.style.opacity = '1';
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    verificarLogo();
    new GerenciadorNotas();
});

