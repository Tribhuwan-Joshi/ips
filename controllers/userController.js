const prisma = require('../prisma/prisma');
const supabase = require('../utils/storage');

const deleteUser = async (req, res) => {
  // delete user from prisma
  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });
  const paths = await prisma.image.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      path: true,
    },
  });

  // delete all images
  await supabase.from('images').remove(paths);

  return res.status(204);
};

module.exports = { deleteUser };
