---
theme: slidev-theme-geist
class: text-center
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
css: unocss
title: Брендирование
---

# Брендирование
# Type Branding 
# 💪


<div class="abs-br m-6 flex gap-2 align-center">
  <span>by Dan Skiba</span>
</div>

<style>
h1 {
display: inline-block;
width: 100%;
text-align: center;
}
</style>


---
clicks: 4
---

# Что же это такое Брендирование?

<v-clicks>

- **AKA** [nominal typing](https://basarat.gitbook.io/typescript/main-1/nominaltyping)
- **AKA**  "type branding”
- **AKA** [[flow] Opaque Type Aliases](https://flow.org/en/docs/types/opaque-types/)

</v-clicks>

<h3 v-click="4" class="center text-center">Давайте выясним через пример 📝</h3>

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>


---

# Найдите баг


```ts {all|17|all}
declare function getPost(postId: number): Promise<Post>;
declare function getUser(userId: number): Promise<User>;

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  authorId: number;
  title: string;
  body: string;
}

function authorOfPost(postId: number): Promise<User> {
  return getPost(postId).then(post => getUser(post.id));
}
```

<arrow v-click="1" x1="720" y1="420" x2="520" y2="445" color="#564" width="3" arrowSize="1" />

  <img src="/assets/brigada.gif"  width="260" height="146" className="gif" v-click="1"/>

<style>
.gif {
  position: absolute;
  bottom: 130px;
  right: 100px;
}
</style>


---
clicks: 4
---

# Исправим код


```ts {all|2}
function authorOfPost(postId: number): Promise<User> {
  return getPost(postId).then(post => getUser(post.authorId));
}
```

<div v-click="2">
    <h3>Но как же впредь избегать подобной ошибки?</h3>
</div>

<div v-click="3">
<span>В идеальном мире мы хотели бы получать ошибку в таком случае</span>

```ts {all|3|all}

function authorOfPost(postId:Post['id']): Promise<User> {
  return getPost(postId).then(post => getUser(post.id)); // Argument of type **post.id** is not assignable to parameter of type **post.authorId**
}
```
</div>


---
clicks: 3
---

## Тут к нам на помощь и приходит Брендирование (Brand Types)


<div v-click="1">
```ts {|5,10|17|all}
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
    
    function authorOfPost(postId:Post['id']): Promise<User> {
      return getPost(postId).then(post => getUser(post.id)); // TS2345: Argument of type 'Brand<number, "post">' is not assignable to parameter of type 'Brand<number, "user">'.   Type 'Brand<number, "post">' is not assignable to type '{ __brand: "user"; }'.     Types of property '__brand' are incompatible.       Type '"post"' is not assignable to type '"user"'.
    }
```
</div>


---
clicks: 5
---

## Что же такое ‘nominal types’?
 
<div v-click="1">
Каждый brand <b>type - уникальный</b> и даже если types содержат одинаковые данные, они <b>не пересекаются</b> между собой
</div>

<div v-click="2" className='mt-8'>
<h3>Реализация:</h3>
</div>

<div v-click="3">
```ts
type Brand<K, T> = K & { __brand: T };
```
</div>

<div v-click="4">
<h3>И это все? 🙋</h3>
</div>

<div v-click="5">
<h3>Да! 😃</h3>
</div>


---
clicks: 6
---

## Что мы имеем:

<v-clicks>

- -- одинаковые с виду type, имеют разные **nominal types**. Различные типы **“брендов”**
- -- Заменили специальные типы `number` типом **look-up type**, тем самым определив интерфейс как центральный элемент. (Сделали ссылочный тип)
- -- Оставили ту же семантику изначального кода
- -- Пофиксили исходный баг
- -- Но остался один риск, что если в приложении, кто-то тоже создаст такой же тип ‘post’ и напишет

</v-clicks>

<v-click at="6">
```ts
  Brand<number, 'post'>
```
</v-click>


---
clicks: 3
---

#### Чтобы избежать подобного, можно использовать преимущество TypeScript - интерфейсы могут быть рекурсивными

<v-clicks at="1">
```ts{2,7|all}
interface User {
  id: Brand<number, User>;
  name: string;
}

interface Post {
id: Brand<number, Post>;
authorId: User['id'];
title: string;
body: string;
}
```
</v-clicks>


---
clicks: 4
---

# Закрепим еще одним примером

```ts {all|6,7,8|10,11|13,14,15}
type Brand<K, T> = K & { __brand: T };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

function euroToUsd(euro: EUR): USD {
  return (euro * 1.18) as USD;
}

const usdValue = 10 as USD;
const euroValue = 10 as EUR;

euroToUsd(12); // error - wrong type ❌
euroToUsd(usdValue); // error - wrong type ❌
euroToUsd(euroValue); // WORKS!!! ✅
```


---
clicks: 5
---

### Заметки:


<v-clicks>

* -- В целом это техника имеет большое отношение к **Aliasing**, который не создает новый type, а создает новое имя, которые ссылается на этот type. Aliasing примитивов не громадное преимущество, но может служить как одна из форм документации.
([https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-aliases](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-aliases))
* -- flow example: opaque-types - [https://flow.org/en/docs/types/opaque-types/](https://flow.org/en/docs/types/opaque-types/)
* -- В теории можно использовать Enum, но [Не работает с number.](https://basarat.gitbook.io/typescript/main-1/nominaltyping#using-enums)
* -- С подобной техникой работает TypeScript Compiler Team. [https://github.com/Microsoft/TypeScript/blob/7b48a182c05ea4dea81bab73ecbbe9e013a79e99/src/compiler/types.ts#L693-L698](https://github.com/Microsoft/TypeScript/blob/7b48a182c05ea4dea81bab73ecbbe9e013a79e99/src/compiler/types.ts#L693-L698)

</v-clicks>


---

### Истоничики:

<v-clicks>

* -- proposal и обсуждения: https://github.com/microsoft/TypeScript/pull/33038
* -- библиотека - https://github.com/kourge/ts-brand - [https://github.com/kourge/ts-brand/blob/master/src/index.ts](https://github.com/kourge/ts-brand/blob/master/src/index.ts)
* --  [https://basarat.gitbook.io/typescript/main-1/nominaltyping](https://basarat.gitbook.io/typescript/main-1/nominaltyping)
* --  [https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d](https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d)
* -- Domain Modeling Made Functional. Tackle Software Complexity with Domain-Driven Design and F#. by Scott Wlaschin

</v-clicks>
