const express = require('express')
const router = express.Router()
const User = require('../models/user.model')

/* Ejemplo petición get */
router.get('/', async (req, res) => {

  try {
    const users = await User.find({})
    
    res.json({
      users: users
    })
  } catch (err) {
    res.json({
      msg: 'Ocurrió un error al buscar usuarios'
    })
  }

})

/* Ejemplo petición get con parámetros de búsqueda con identificador */
router.get('/:id', (req, res) => {
  res.json({msg: 'Acá te envío el usuario con id === ' + req.params.id})
})

/* Ejemplo petición post */
router.post('/', async (req, res) => {

  const user = new User({
    name: req.body.name
  })

  try {
    const newUser = await user.save()

    res.json({
      user: newUser
    })
  } catch (err) {
    res.json({
      msg: 'Ocurrió un error al crear el usuario.'
    })
  }

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