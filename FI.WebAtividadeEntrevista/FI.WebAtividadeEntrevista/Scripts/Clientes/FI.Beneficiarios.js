var beneficiarios = null;
var idBeneficiarioParaAlterar = null;


$(document).ready(function () {

    ObterBeneficiarios();

    $('#formBeneficiario').submit(async function (e) { //trigger submit beneficiário
        e.preventDefault();

        if (idBeneficiarioParaAlterar != null) {
            await AlterarBeneficiario();
            idBeneficiarioParaAlterar = null;
            $("#formBeneficiario")[0].reset();
        } else {
            await AdicionarBeneficiario();
            $("#formBeneficiario")[0].reset();
        }
    })

    $('#beneficiarioModal').on('hidden.bs.modal', function () {
        $("#formBeneficiario")[0].reset();
        idBeneficiarioParaAlterar = null;
    })
    
})

$(() => {
    $("#CPFBeneficiario").mask("000.000.000-00");
});


async function AdicionarBeneficiario(e) {

    var novoBeneficiario = {
        Id: GerarIDTemporario(),
        Nome: $("#NomeBeneficiario").val(),
        CPF: $("#CPFBeneficiario").val(),
        IdCliente: obj.Id,
        Adicionado: true
    }
    if (await ValidarCPF($("#CPFBeneficiario").val())) {
        beneficiarios.push(novoBeneficiario);
        Atualizartabela(beneficiarios);
    }
}

function DeletarBeneficiario(idBeneficiario) {

    var index = beneficiarios.findIndex(item => item.Id == idBeneficiario);
    if (beneficiarios[index].Adicionado != undefined) {
        beneficiarios.splice(index, 1);
    } else {
        beneficiarios[index].Removido = true;
    }
    Atualizartabela(beneficiarios);


}

function GerarIDTemporario() {
    var idTemp = Math.random().toString().replace('.', '');
    while (beneficiarios.filter(item => item.id == idTemp).length > 0) {
        idTemp = Math.random().toString().replace('.', '');
    }
    return idTemp;
}

async function AlterarBeneficiario(idBeneficiario, cpf,nome) {

    if (idBeneficiarioParaAlterar == null || idBeneficiario != null) {
        $("#NomeBeneficiario").val(nome);
        $("#CPFBeneficiario").val(cpf);
        idBeneficiarioParaAlterar = idBeneficiario;
    } else {
        if (await ValidarCPF($("#CPFBeneficiario").val(), idBeneficiarioParaAlterar)) {
            var index = beneficiarios.findIndex(item => item.Id == idBeneficiarioParaAlterar);
            beneficiarios[index].Nome = $("#NomeBeneficiario").val();
            beneficiarios[index].CPF = $("#CPFBeneficiario").val();
            if (beneficiarios[index].Adicionado == undefined) beneficiarios[index].Alterado = true;
            Atualizartabela(beneficiarios);
        }
    }
}

function ObterBeneficiarios() {


    if (obj != null) {
        $.ajax({
            url: urlGetBeneficiarios,
            method: "POST",
            data: {
                "idCliente": obj.Id
            },
            error:
                function (r) {
                    if (r.status == 400)
                        ModalDialog("Ocorreu um erro", r.responseJSON);
                    else if (r.status == 500)
                        ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                },
            success:
                function (r) {
                    beneficiarios = r.Records;
                    Atualizartabela(beneficiarios);
                }
        });
    } else {
        obj = { Id: "X" }
        beneficiarios = [];
        Atualizartabela(beneficiarios);
    }
}

async function ValidarCPF(cpf, id = -1 ) {

    var retorno = true;
    if (id != -1) {
        if (beneficiarios.filter(item => item.Removido == undefined).find(item => item.CPF == cpf && item.id == id) != undefined) {
            ModalDialog("Ocorreu um erro", "CPF já cadastrado para esse Cliente");
            retorno = false;
        }
    } else {
        if (beneficiarios.filter(item => item.Removido == undefined).find(item => item.CPF == cpf) != undefined) {
            ModalDialog("Ocorreu um erro", "CPF já cadastrado para esse Cliente");
            retorno = false;
        }
    }
   
    await $.ajax({
        url: urlValidarCPFPostBeneficiarios,
        method: "POST",
        data: {
            "cpf": cpf
        },
        error:
            function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", "CPF inválido. Por favor, verifique se está correto.");
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
            },
        success:
            function (r) {
                retorno = retorno && r;
            }
    });

    return retorno;
}

function Atualizartabela(data) {
    data = data.filter(item => item.Removido == undefined)
    $("#gridBeneficiarios tbody").empty()
    for (var i = 0; i < data.length; i++) {
        var tr = '<tr>                  ' +
            '<td>' + data[i].CPF + '</td>   ' +
            '<td>' + data[i].Nome + '</td>' +
            '<td> <button onclick = "AlterarBeneficiario(' + data[i].Id + ',\'' + data[i].CPF + '\',\'' + data[i].Nome + '\')" class="btn btn-primary btn-sm" > Alterar</button > ' +
            '<button onclick="DeletarBeneficiario(' + data[i].Id + ');" class="btn btn-primary btn-sm" style="margin-left:5%">Excluir</button> </td>    ' +
            '</tr >                ';
        $("#gridBeneficiarios tbody").append(tr);
    }
}
var promises = [];
async function EnviarModificacoesBeneficiarios(idCliente = null) {
    promises = [];
    if (idCliente != null) {
        obj.Id = idCliente;
    }
    for  (var i = 0; i < beneficiarios.length; i++) {
        if (beneficiarios[i].Removido != undefined) {

            promises.push( $.ajax({
                url: urlDeletarPostBeneficiarios,
                method: "POST",
                data: {
                    "Id": beneficiarios[i].Id
                },
                error:
                    function (r) {
                        if (r.status == 400)
                            ModalDialog("Ocorreu um erro", r.responseJSON);
                        else if (r.status == 500)
                            ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                    },
                success:
                    function (r) {
                        //FillTableBeneficiarios();
                    }
            }));

        } else if (beneficiarios[i].Alterado != undefined) {
            promises.push( $.ajax({
                url: urlAlterarPostBeneficiarios,
                method: "POST",
                data: {
                    "Id": beneficiarios[i].Id,
                    "Nome": beneficiarios[i].Nome,
                    "CPF": beneficiarios[i].CPF,
                    "IdCliente": obj.Id
                },
                error:
                    function (r) {
                        if (r.status == 400)
                            ModalDialog("Ocorreu um erro", r.responseJSON);
                        else if (r.status == 500)
                            ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                    },
                success:
                    function (r) {
                        //FillTableBeneficiarios();
                    }
            }));
        }
        else if (beneficiarios[i].Adicionado != undefined) {
            promises.push( $.ajax({
                 url: urlPostBeneficiarios,
                 method: "POST",
                 data: {
                     "Nome": beneficiarios[i].Nome,
                     "CPF": beneficiarios[i].CPF,
                     "IdCliente": obj.Id
                 },
                 error:
                     function (r) {
                         if (r.status == 400)
                             ModalDialog("Ocorreu um erro", r.responseJSON);
                         else if (r.status == 500)
                             ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                     },
                 success:
                     function (r) {
                        //FillTableBeneficiarios();
                     }
             }));
        }
    }
    await Promise.all(promises);
    beneficiarios = [];
    Atualizartabela(beneficiarios);
}
