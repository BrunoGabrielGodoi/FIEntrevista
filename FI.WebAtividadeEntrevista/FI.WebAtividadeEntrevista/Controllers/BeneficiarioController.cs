using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;
using WebAtividadeEntrevista.Validators;

namespace WebAtividadeEntrevista.Controllers
{
    public class BeneficiarioController : Controller
    {


        [HttpPost]
        public JsonResult ListarPorCliente(long idCliente)
        {
            try
            {
                BoBeneficiario boBeneficiario = new BoBeneficiario();
                List<Beneficiario> beneficiarios = boBeneficiario.ListarPorCliente(idCliente);
                List<BeneficiarioModel> beneficiarioModels = null;


                beneficiarioModels = beneficiarios.Select(x => new BeneficiarioModel()
                {
                    Id = x.Id,
                    CPF = x.CPF,
                    Nome = x.Nome,
                    IdCliente = x.IdCliente

                }).ToList();
                //Return result to jTable
                return Json(new { Result = "OK", Records = beneficiarioModels, TotalRecordCount = beneficiarioModels.Count });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }



        [HttpPost]
        public JsonResult Incluir(BeneficiarioModel model)
        {
            BoBeneficiario bo = new BoBeneficiario();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine + "<br/>", erros));
            }
            else if (bo.VerificarExistencia(model.CPF, model.IdCliente))
            {
                Response.StatusCode = 400;
                return Json("Beneficiário já cadastrado para esse cliente!");
            }
            else
            {

                model.Id = bo.Incluir(new Beneficiario()
                {
                    CPF = model.CPF,
                    Nome = model.Nome,
                    IdCliente = model.IdCliente
                });


                return Json("Cadastro efetuado com sucesso");
            }
        }

        [HttpPost]
        public JsonResult Excluir(long id)
        {
            BoBeneficiario bo = new BoBeneficiario();
            bo.Excluir(id);
            return Json("Cadastro efetuado com sucesso");
            
        }

        [HttpPost]
        public JsonResult Alterar(BeneficiarioModel model)
        {
            BoBeneficiario bo = new BoBeneficiario();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
            else if (bo.VerificarExistencia(model.CPF, model.IdCliente, model.Id))
            {
                Response.StatusCode = 400;
                return Json("Beneficiário já cadastrado para esse cliente!");
            }
            else
            {
                bo.Alterar(new Beneficiario()
                {
                    Id = model.Id,
                    Nome = model.Nome,
                    CPF = model.CPF,
                    IdCliente = model.IdCliente
                });

                return Json("Alterado com sucesso");
            }
        }

        [HttpPost]
        public JsonResult ValidarCPF(string cpf)
        {
            BoBeneficiario bo = new BoBeneficiario();

            var validador = new CPFAttribute();
            if (!validador.IsValid(cpf))
            {
                Response.StatusCode = 400;
                return Json(false);
            }
            return Json(true);
        }
    }
}