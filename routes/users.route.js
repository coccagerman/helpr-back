const express = require('express')
const router = express.Router()

/* Ejemplo petición get */
router.get('/', (req, res) => {
  res.json({msg: 'Acá te envío los usuarios'})
})

/* Ejemplo petición get con parámetros de búsqueda con identificador */
router.get('/:id', (req, res) => {
  res.json({msg: 'Acá te envío el usuario con id === req.params.id'})
})

/* Ejemplo petición post */
router.post('/', (req, res) => {
  res.json({
      msg: 'Se ha creado un nuevo usuario.',
      userData: req.body
  })
})

/* Ejemplo petición put */
router.put('/:id', (req, res) => {
  res.json({
      msg: 'Se ha modificado el usuario.',
      id: req.params.id,
      userData: req.body
  })
})

/* Ejemplo petición delete */
router.delete('/users/:id', (req, res) => {
  res.json({
      msg: 'Se ha eliminado el usuario.',
      id: req.params.id
  })
})

module.exports = router