using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebAtividadeEntrevista.Validators;

namespace WebAtividadeEntrevista.Models
{
    /// <summary>
    /// Classe de Modelo de Beneficiario
    /// </summary>
    public class BeneficiarioModel
    {
        public long Id { get; set; }
        
        /// <summary>
        /// CPF
        /// </summary>
        [Required]
        [CPF(ErrorMessage = "Cpf inválido, por favor confira se o digitou corretamente")]
        public string CPF { get; set; }

        /// <summary>
        /// Nome
        /// </summary>
        [Required]
        public string Nome { get; set; }

        /// <summary>
        /// Id Cliente vinculado
        /// </summary>
        [Required]
        public long IdCliente { get; set; }
    }    
}