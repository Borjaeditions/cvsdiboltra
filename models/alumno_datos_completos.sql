SELECT 
    CONCAT(a.nombre, ' ', a.ap_paterno, ' ', a.ap_materno) AS nombre_completo,
	cg.genero,
    aia.boleta,
	ces.nombre_estado AS originario,
	cesr.nombre_estado AS radica,
	ai.telefono,
    ce.nombre_escuela AS escuela,
    cc.nombre_carrera AS carrera,
    csa.Descripcion AS estatus_academico,
    ai.email AS correo,
    ai.telefono,
    ai.celular,
	aid.certificacion,
	aid.porc_escrito,
	aid.porc_hablado,
	acc.cadena_aleatoria,
	acc.fecha,
	acc.id_confirmacion,
	cn.nombre_pais AS Nacionalidad,
	cn.pais,
	cn.pais_renapo,
	cev.estado_civil,
	ah.habilidad,
	aca.nombre_curso,
	aca.fecha_inicio,
	aca.fecha_fin,
	aca.institucion,
	aca.documento_obtenido,
	ael.empresa,
	ael.puesto,	
	ael.actividades,
	ael.fecha_inicio
FROM alumno a
LEFT JOIN alumno_informacion ai ON a.curp = ai.curp
LEFT JOIN catalogo_estado ces ON ces.id_estado =ai.originario
LEFT JOIN catalogo_estado cesr ON cesr.id_estado = ai.radica
LEFT JOIN catalogo_genero cg ON cg.id_genero = ai.id_genero
LEFT JOIN alumno_informacion_academica aia ON ai.curp = aia.curp
LEFT JOIN escuela_carrera ec ON aia.id_escuela_carrera = ec.id_escuela_carrera
LEFT JOIN catalogo_escuela ce ON ec.id_cat_escuela = ce.id_cat_escuela
LEFT JOIN catalogo_carrera cc ON ec.id_carrera = cc.id_carrera
LEFT JOIN catalogo_situacion_academica csa ON aia.id_situacion_academica = csa.id_situacion_academica
LEFT JOIN alumno_confirmacion_correo acc ON acc.curp = ai.curp
LEFT JOIN catalogo_nacionalidad cn ON  cn.id_pais = ai.id_pais
LEFT JOIN catalogo_estado_civil cev ON cev.id_estado_civil = ai.id_estado_civil
LEFT JOIN alumno_habilidades ah ON ah.curp = a.curp
LEFT JOIN alumno_curso_actualizacion aca ON aca.curp = ai.curp
LEFT JOIN alumno_idioma aid ON aid.curp = ai.curp
LEFT JOIN alumno_experiencia_laboral ael ON ael.curp = ai.curp
where csa.Descripcion in ('Pasante', 'Titulado') and ai.curp = 'BOHA971107HVZRRL01'