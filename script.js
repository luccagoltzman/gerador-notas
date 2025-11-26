// Gerenciador de Notas
class GerenciadorNotas {
    constructor() {
        this.notas = [];
        this.notaAtual = null;
        this.carregarNotas();
        this.inicializarEventos();
        this.renderizarLista();
    }

    // Carregar notas do localStorage ou usar dados padrão
    carregarNotas() {
        console.log('🔍 DEBUG: Carregando notas do localStorage...');
        const notasSalvas = localStorage.getItem('notasMaritimas');
        if (notasSalvas) {
            this.notas = JSON.parse(notasSalvas);
            console.log('🔍 DEBUG: Notas carregadas:', this.notas.length);
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
            let templatesAtualizados = 0;
            this.notas = this.notas.map(nota => {
                if (nota.nome && nota.nome.includes('CFN') && nota.template && !nota.template.includes('LOGO SEVEN')) {
                    console.log('🔄 DEBUG: Atualizando template CFN antigo (sem logo)');
                    nota.template = this.getTemplateCFN();
                    precisaSalvar = true;
                    templatesAtualizados++;
                } else if (nota.nome && nota.nome.includes('Certificado de Retirada') && nota.template && !nota.template.includes('LOGO SEVEN')) {
                    console.log('🔄 DEBUG: Atualizando template Certificado antigo (sem logo)');
                    nota.template = this.getTemplateCertificadoResiduo();
                    precisaSalvar = true;
                    templatesAtualizados++;
                }
                return nota;
            });
            
            if (templatesAtualizados > 0) {
                console.log(`✅ DEBUG: ${templatesAtualizados} template(s) atualizado(s) automaticamente com logo`);
            }
            
            if (precisaSalvar) {
                this.salvarNotas();
            }
        } else {
            console.log('🔍 DEBUG: Nenhuma nota salva, criando templates padrão...');
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
            console.log('✅ DEBUG: Templates padrão criados');
            this.salvarNotas();
        }
        
        // Verificar se as notas têm logo
        this.notas.forEach(nota => {
            if (nota.template && nota.template.includes('LOGO SEVEN')) {
                console.log('✅ DEBUG: Nota', nota.nome, 'contém referência à logo');
            } else {
                console.warn('⚠️ DEBUG: Nota', nota.nome, 'NÃO contém referência à logo');
            }
        });
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
                        <img src="assets/logo/LOGO SEVEN.svg" alt="SEVEN NAVEGAÇÃO" onerror="console.error('❌ Erro ao carregar logo:', this.src); this.style.display='none';" onload="console.log('✅ Logo carregada:', this.src);" />
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
                        <img src="assets/logo/LOGO SEVEN.svg" alt="SEVEN NAVEGAÇÃO" style="max-width: 100%; height: auto;" onerror="console.error('❌ Erro ao carregar logo:', this.src); this.style.display='none';" onload="console.log('✅ Logo carregada:', this.src);" />
                    </div>
                </td>
                <td style="width: 75%; padding: 8px; border: 1px solid #1d1b78; border-left: 1px solid #1d1b78; vertical-align: middle;">
                    <h1 style="font-size: 16px; margin: 0 0 4px 0; color: #1d1b78; font-weight: bold; text-align: left;">CERTIFICADO DE RETIRADA DE RESÍDUO</h1>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;"><strong>SERVI-PORTO - SERVIÇOS PORTUÁRIOS LTDA.</strong></p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">CNPJ: 12.097.762/0001-37</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">Av. Senador Vitorino Freire, 1990 - Areinha / São Luis / MA. Brasil</p>
                    <p style="font-size: 10px; margin: 2px 0; color: #000; line-height: 1.3; text-align: left;">Telefone: (98) 3232-7259</p>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: right; padding: 6px; border: 1px solid #1d1b78; border-top: 1px solid #1d1b78;">
                    <strong style="font-size: 12px; color: #1d1b78;">CERTIFICADO N. (Certificate No.):</strong> <span style="border-bottom: 2px solid #1d1b78; padding: 0 15px; font-weight: bold; font-size: 14px; margin-left: 8px;">&nbsp;</span>
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

        if (tab === 'editor') {
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
        
        console.log('🔍 DEBUG: URL base calculada:', baseUrl);
        console.log('🔍 DEBUG: URL completa da página:', window.location.href);
        
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
        
        // Verificar se há alguma referência à logo
        const logoMatches = template.match(/src="[^"]*LOGO[^"]*"/g);
        if (logoMatches) {
            console.log('🔍 DEBUG: Caminhos da logo encontrados:', logoMatches);
        } else {
            console.warn('⚠️ DEBUG: Nenhum caminho da logo encontrado no template');
        }
        
        return template;
    }

    // Atualizar preview
    atualizarPreview() {
        const preview = document.getElementById('previewNota');
        if (!preview || !this.notaAtual) {
            console.log('⚠️ DEBUG: Preview ou nota atual não encontrado');
            return;
        }
        
        console.log('🔍 DEBUG: Atualizando preview para nota:', this.notaAtual.nome);
        
        // Tentar usar template, se não tiver, usar conteudo convertido
        let template = this.notaAtual.template;
        if (!template && this.notaAtual.conteudo) {
            template = this.converterTextoParaHTML(this.notaAtual.conteudo);
        }
        
        if (template) {
            // Corrigir caminhos antes de renderizar
            template = this.corrigirCaminhosTemplate(template);
            
            // Adicionar script de debug no iframe
            template = template.replace('</body>', `
                <script>
                    console.log('🔍 DEBUG: Iframe carregado');
                    window.addEventListener('load', function() {
                        const img = document.querySelector('img[src*="LOGO"]');
                        if (img) {
                            console.log('🔍 DEBUG: Imagem encontrada, src:', img.src);
                            img.onerror = function() {
                                console.error('❌ DEBUG: Erro ao carregar logo:', this.src);
                                console.error('❌ DEBUG: URL completa:', window.location.href);
                            };
                            img.onload = function() {
                                console.log('✅ DEBUG: Logo carregada com sucesso!');
                            };
                        } else {
                            console.warn('⚠️ DEBUG: Imagem da logo não encontrada no DOM');
                        }
                    });
                </script>
            </body>`);
            
            preview.srcdoc = template;
            console.log('✅ DEBUG: Preview atualizado');
        } else {
            preview.srcdoc = '<html><body><p style="padding: 20px; color: #999;">Nenhum template disponível. Edite a nota para adicionar conteúdo.</p></body></html>';
            console.warn('⚠️ DEBUG: Nenhum template disponível');
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
        
        console.log('🔍 DEBUG: Gerando nota para impressão:', this.notaAtual.nome);
        
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
        
        console.log('🔍 DEBUG: Visualizando nota:', this.notaAtual.nome);
        
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

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new GerenciadorNotas();
});

