﻿CREATE PROC FI_SP_VerificaBeneficiario
	@CPF       VARCHAR(14),
	@IDCLIENTE BIGINT,
	@ID        BIGINT
AS
BEGIN
	IF @ID = -1
		BEGIN
			SELECT 1 FROM BENEFICIARIOS WHERE CPF = @CPF AND IDCLIENTE = @IDCLIENTE
		END
	ELSE
		BEGIN
			SELECT 1 FROM BENEFICIARIOS WHERE CPF = @CPF AND IDCLIENTE = @IDCLIENTE AND ID != @ID
		END
END