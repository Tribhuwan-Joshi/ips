const prisma = require('../prisma/prisma');
const supabase = require('../utils/storage');
require('express-async-errors');

const deleteUser = async (req, res) => {
  try {
    const [paths, res] = await prisma.$transaction([
      prisma.image.findMany({
        where: {
          userId: parseInt(req.user.id),
        },
        select: {
          path: true,
        },
      }),
      prisma.user.delete({
        where: {
          id: req.user.id,
        },
      }),
    ]);
    console.log(paths, ' gonna get deleted');
    const mappedPath = paths.map((o) => o.path);
    console.log(mappedPath);
    if (res.error) console.log(res.error);
    await supabase.from('images').remove(mappedPath);
    console.log('removed');

    return res.sendStatus(204);
  } catch (error) {
    console.error('User deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { deleteUser };
