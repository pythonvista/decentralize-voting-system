const router = require('express').Router();
const controller = require('../controllers/voteController');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/authMiddleware');

router.get('/candidates', controller.getCandidates);
router.get('/results', controller.getResults);
router.get(
  '/vote/status',
  authenticateToken,
  authorizeRoles('admin', 'user'),
  controller.getVoteStatus,
);
router.post(
  '/candidates',
  authenticateToken,
  authorizeRoles('admin'),
  controller.createCandidate,
);
router.post(
  '/vote',
  authenticateToken,
  authorizeRoles('admin', 'user'),
  controller.submitVote,
);

module.exports = router;

