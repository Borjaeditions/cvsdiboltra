SELECT 
    CONCAT(a.nombre, ' ', a.ap_paterno, ' ', a.ap_materno) AS nombre_completo,
    aia.boleta,
    ce.nombre_escuela AS escuela,
    cc.nombre_carrera AS carrera,
    csa.Descripcion AS estatus_academico,
    ai.email AS correo,
    ai.telefono,
    ai.celular
FROM alumno a
LEFT JOIN alumno_informacion ai ON a.curp = ai.curp
LEFT JOIN alumno_informacion_academica aia ON ai.curp = aia.curp
LEFT JOIN escuela_carrera ec ON aia.id_escuela_carrera = ec.id_escuela_carrera
LEFT JOIN catalogo_escuela ce ON ec.id_cat_escuela = ce.id_cat_escuela
LEFT JOIN catalogo_carrera cc ON ec.id_carrera = cc.id_carrera
LEFT JOIN catalogo_situacion_academica csa ON aia.id_situacion_academica = csa.id_situacion_academica
where csa.Descripcion in ('Pasante', 'Titulado')