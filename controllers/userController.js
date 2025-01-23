const prisma = require('../prisma/prisma');
const supabase = require('../utils/storage');

const deleteUser = async (req, res) => {
  try {
    await prisma.$transaction(async (prisma) => {
      const paths = await prisma.image.findMany({
        where: {
          userId: parseInt(req.user.id),
        },
        select: {
          path: true,
        },
      });

      await prisma.user.delete({
        where: {
          id: req.user.id,
        },
      });

      console.log(paths, ' gonna get deleted');
      await supabase.from('images').remove(paths);
      console.log('removed');
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error('User deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { deleteUser };
