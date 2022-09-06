declare function getPost(postId: Post['id']): Promise<Post>;
declare function getUser(userId: User['id']): Promise<User>;

interface User {
  id: Brand<number, 'user'>;
  name: string;
}

interface Post {
  id: Brand<number, 'post'>;
  authorId: User['id'];
  title: string;
  body: string;
}

// function authorOfPost(postId: Post['id']): Promise<User> {
function authorOfPost(postId: Post['id']): Promise<User> {
  return getPost(postId).then(post => getUser(post.id)); // Argument of type ******** is not assignable to parameter of type ********
}

type Brand<K, T> = K & { __brand: T };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

const usdValue = 10 as USD;
const euroValue = 10 as EUR;

function euroToUsd(euro: EUR): USD {
  return (euro * 1.18) as USD;
}

euroToUsd(12); // error - wrong type
euroToUsd(usdValue); // error - wrong type
euroToUsd(euroValue); // WORKS!!!
