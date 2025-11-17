const router = require('express').Router();
const controller = require('../controllers/voteController');

router.get('/candidates', controller.getCandidates);
router.get('/results', controller.getResults);
router.post('/vote', controller.submitVote);

module.exports = router;

