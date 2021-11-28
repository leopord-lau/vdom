# vdom

Html parser and virtual dom inspired by vue2.

here's a blog in chinese;

# vue 知识

## `SPA`单页面的理解

`SPA`（ `single-page application` ）仅在 `Web` 页面初始化时加载相应的 `HTML`、`JavaScript` 和 `CSS`。一旦页面加载完成，`SPA` 不会因为用户的操作而进行页面的重新加载或跳转；取而代之的是利用路由机制实现 `HTML` 内容的变换，`UI` 与用户的交互，避免页面的重新加载。

**优点**

- 用户体验好、快，内容的改变不需要重新加载整个页面，避免了不必要的跳转和重复渲染；
- 基于上面一点，SPA 相对对服务器压力小；
- 前后端职责分离，架构清晰，前端进行交互逻辑，后端负责数据处理；

**缺点**

- 初次加载耗时多：为实现单页 `Web` 应用功能及显示效果，需要在加载页面的时候将 `JavaScript`、`CSS` 统一加载，部分页面按需加载；
- 前进后退路由管理：由于单页应用在一个页面中显示所有的内容，所以不能使用浏览器的前进后退功能，所有的页面切换需要自己建立堆栈管理；
- `SEO` 难度较大：由于所有的内容都在一个页面中动态替换显示，所以在 `SEO` 上其有着天然的弱势。

## `vue`生命周期

`Vue` 实例有一个完整的生命周期，也就是从开始创建、初始化数据、编译模版、挂载 `Dom` -> 渲染、更新 -> 渲染、卸载等一系列过程，我们称这是 `Vue` 的生命周期。

| 生命周期      | 描述                                                                  |
| ------------- | --------------------------------------------------------------------- |
| beforeCreate  | 组件实例被创建之初，组件的属性生效之前                                |
| created       | 组件实例已经完全创建，属性也绑定，但真实 dom 还没有生成，$el 还不可用 |
| beforeMount   | 在挂载开始之前被调用：相关的 render 函数首次被调用                    |
| mounted       | el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子             |
| beforeUpdate  | 组件数据更新之前调用，发生在虚拟 DOM 打补丁之前                       |
| update        | 组件数据更新之后                                                      |
| activited     | keep-alive 专属，组件被激活时调用                                     |
| deactivated   | keep-alive 专属，组件被销毁时调用                                     |
| beforeDestory | 组件销毁前调用                                                        |
| destoryed     | 组件销毁后调用                                                        |

## 父组件和子组件生命周期钩子函数执行顺序

`Vue` 的父组件和子组件生命周期钩子函数执行顺序可以归类为以下 4 部分：

- 加载渲染过程

父 `beforeCreate` -> 父 `created` -> 父 `beforeMount` -> 子 `beforeCreate` -> 子` created` -> 子 `beforeMount` -> 子`mounted` -> 父 `mounted`

- 子组件更新过程

父 `beforeUpdate` -> 子 `beforeUpdate` -> 子 `updated` -> 父 `updated`

- 父组件更新过程

父 `beforeUpdate` -> 父 `updated`

- 销毁过程

父 `beforeDestroy` -> 子 `beforeDestroy` -> 子 `destroyed` -> 父`destroyed`

## 异步请求

可以在钩子函数 `created`、`beforeMount`、`mounted` 中进行调用，因为在这三个钩子函数中，`data` 已经创建，可以将服务端端返回的数据进行赋值。但是本人推荐在 `created` 钩子函数中调用异步请求，因为在 `created` 钩子函数中调用异步请求有以下优点：

- 能更快获取到服务端数据，减少页面 `loading` 时间；
- `ssr` 不支持 `beforeMount` 、`mounted` 钩子函数，所以放在 `created` 中有助于一致性；

## `v-if`与`v-show`的区别

`v-if` 是真正的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块(只有当条件为`true`时，该元素才会存在与`dom`树上)。

`v-show` 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 `CSS` 的 `“display”` 属性进行切换(条件为`false`，`display`值为`none`，但此时`dom`树上存在这个元素).

所以，`v-if` 适用于在运行时很少改变条件，不需要频繁切换条件的场景；`v-show` 则适用于需要非常频繁切换条件的场景。

## `class`与`style`动态绑定的方式

1. 对象语法

`class`

```js
<div :class="{active: isActive, 'danger': hasError}"></div>

data: {
  isActive: true,
  hasError: false
}
```

`style`类似

```js
<div :style"{color: activeColor, fontSize: fontSize + 'px'}"></div>

data: {
  activeColor: 'blue',
  fontSize: 30
}
```

2. 数组语法

`class`

```js
<div :class="[isActive ? activeClass : '', errorClass]"></div>

data: {
  activeClass: 'active'
  errorClass: 'danger'
}
```

`style`类似

```js
<div :style"[styleColor, styleSize]"></div>

data: {
  styleColor: {
    color: 'red'
  },
  styleSize: {
    fontSize: '30px'
  }
}
```

## `Vue`单向数据流

所有的 `prop` 都使得其父子 `prop` 之间形成了一个单向下行绑定：父级 `prop` 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。

额外的，每次父级组件发生更新时，子组件中所有的 `prop` 都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变 `prop`。如果你这样做了，`Vue` 会在浏览器的控制台中发出警告。子组件想修改时，只能通过`$emit` 派发一个自定义事件，父组件接收到后，由父组件修改。

有两种常见的试图改变一个 `prop` 的情形 :

这个 `prop` 用来传递一个初始值；这个子组件接下来希望将其作为一个本地的 `prop` 数据来使用。 在这种情况下，最好定义一个本地的 `data` 属性并将这个 `prop` 用作其初始值：

```js
props: ['initialCounter'],
data: function () {
  return {
    counter: this.initialCounter
  }
}
```

这个 `prop` 以一种原始的值传入且需要进行转换。 在这种情况下，最好使用这个 `prop` 的值来定义一个计算属性

```js
props: ['size'],
computed: {
  normalizedSize: function () {
    return this.size.trim().toLowerCase()
  }
}
```

## `computed`和`watch`

`computed`： 是计算属性，依赖其它属性值，并且 `computed` 的值有缓存，只有它依赖的属性值发生改变，下一次获取 `computed` 的值时才会重新计算 `computed` 的值；

`watch`： 更多的是「观察」的作用，类似于某些数据的监听回调 ，每当监听的数据变化时都会执行回调进行后续操作；

**运用场景**：

- 当我们需要进行数值计算，并且依赖于其它数据时，应该使用 `computed`，因为可以利用 `computed` 的缓存特性，避免每次获取值时，都要重新计算；

- 当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 `watch`，使用 `watch` 选项允许我们执行异步操作 ( 访问一个 API )，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

## 组件通信的六种方式

### 一、 `props` / `$emit`

1. 父组件 -> 子组件

父组件

```html
<Son :name="name" />
```

子组件

```html
<template>
  <h1>{{name}}</h1>
</template>

<script>
  export default {
    props: {
      name: {
        type: String,
        required: true,
      },
    },
  };
</script>
```

2. 子组件 -> 父组件

父组件

```html
<template>
  <div id="app">
    <Son :name="named" @updateName="updateName"></Son>
  </div>
</template>

<script>
  import Son from './son.vue';

  export default {
    name: 'App',
    data() {
      return {
        named: 'leo',
      };
    },
    components: {
      Son,
    },
    methods: {
      updateName(name) {
        this.named = name;
      },
    },
  };
</script>
```

子组件

```html
<template>
  <h1 @click="changeName">{{name}}</h1>
</template>

<script>
  export default {
    props: {
      name: {
        type: String,
        required: true,
      },
    },
    methods: {
      changeName() {
        this.$emit('updateName', '子组件向父组件传值');
      },
    },
  };
</script>
```

### 二、 `$emit` / `$on`

这种方法通过一个空的`Vue`实例作为中央事件总线（事件中心），用它来触发事件和监听事件,巧妙而轻量地实现了任何组件间的通信，包括父子、兄弟、跨级。

为了方便将`Bus`（空`vue`）定义在一个组件中，在实际的运用中一般会新建一个`Bus.js`

```js
import Vue from 'vue';
const Bus = new Vue();
export default Bus;
```

组件 1：

```js
import Bus from './Bus'

export default {
    data() {
        return {
            .........
            }
      },
  methods: {
        ....
        Bus.$emit('updateName', 'leo')
    },

  }
```

组件 2：

```js
import Bus from './Bus'

export default {
    data() {
        return {
            .........
            }
      },
    mounted () {
       Bus.$on('updateName', content => {
          console.log(content)
        });
    }
}
```

当然也可以直接将 Bus 注入到 Vue 根对象中。

```js
new Vue({
  render: (h) => h(App),
  data: {
    Bus: new Vue(),
  },
}).$mount('#app');
```

在子组件中通过`this.$root.Bus.$on()`,`this.$root.Bus.$emit()`来调用。

将`bus`挂载到`vue.prototype`上。

```js
// plugin/index.js
import Bus from 'vue';
let install = function (Vue) {
    ... ...
    // 设置eventBus
    Vue.prototype.bus = new Bus();
    ... ...
}

export default {install};

// main.js
import Vue from 'vue';
import plugin from './plugin/index';

Vue.use(plugin);
```

组件一中定义

```js
created () {
  this.bus.$on('updateData', this.getdata);
}
```

组件二中调用

```js
this.bus.$emit('updateData', { loading: false });
```

注意：注册的总线事件要在组件销毁时卸载，否则会多次挂载，造成触发一次但多个响应的情况

```js
beforeDestroy () {
  this.bus.$off('updateData', this.getData);
}
```

### 三、 `vuex`

`Vuex` 是一个专为 `Vue.js`应用开发的状态管理模式，集中式存储管理应用所有组件的状态。
`Vuex`遵循“单向数据流”理念，易于问题追踪以及提高代码可维护性。

`state`保存数据状态，`mutations`用于修改状态。

```js
export default new Vuex.Store({
  state: { count: 0 },
  mutations: {
    increment(state) {
      state.count += 1;
    },
  },
});
```

使用：

```html
<template>
  <div>
    <div>数字： {{$store.state.count}}</div>
    <button @click="add">增加</button>
  </div>
</template>

<script>
  export default {
    methods: {
      add() {
        this.$store.commit('increment');
      },
    },
  };
</script>
```

#### `vuex`结合`localStorage`

`vuex` 是 `vue` 的状态管理器，存储的数据是响应式的。但是并不会保存起来，刷新之后就回到了初始状态，具体做法应该在`vuex`里数据改变的时候把数据拷贝一份保存到`localStorage`里面，刷新之后，如果`localStorage`里有保存的数据，取出来再替换`store`里的`state`。

```js
let defaultNum = 0;
try {
  // 用户关闭了本地存储功能，此时在外层加个try...catch
  if (!defaultNum) {
    defaultNum = Number(window.localStorage.getItem('defaultNum'));
  }
} catch (e) {}

export default new Vuex.Store({
  state: { count: defaultNum },
  mutations: {
    increment(state) {
      state.count += 1;
      try {
        window.localStorage.setItem('defaultNum', state.count);
      } catch (e) {}
    },
  },
});
```

这里需要注意的是：由于`vuex`里，我们保存的状态，是数字，而`localStorage`只支持字符串，所以需要转换一下。

### 四、`$attrs` / `$listeners`

多级组件嵌套需要传递数据时，通常使用的方法是通过`vuex`。但如果仅仅是传递数据，而不做中间处理，使用 `vuex` 处理，未免有点大材小用。为此`Vue2.4` 版本提供了另一种方法----`$attrs` / `$listeners`。

- `$attrs`：包含了父作用域中不被 `prop` 所识别 (且获取) 的特性绑定 (`class` 和 `style` 除外)。当一个组件没有声明任何 `prop` 时，这里会包含所有父作用域的绑定 (`class` 和 `style` 除外)，并且可以通过 `v-bind="$attrs"` 传入内部组件。通常配合 `inheritAttrs` 选项一起使用。(`inheritAttrs`可以关闭自动挂载到组件根元素上的没有在`props`声明的属性，默认为`true`，也就是子组件上没有在`props`声明的属性都是添加到元素的标签上)

- `$listeners`：包含了父作用域中的 (不含 `.native` 修饰器的) `v-on` 事件监听器。它可以通过 `v-on="$listeners"` 传入内部组件。

```html
// father.vue
<Son
  :foo="foo"
  :boo="boo"
  :coo="coo"
  :doo="doo"
  @method1="method1"
  @method2="method2"
></Son>

<script>
  import Son from './son.vue';

  export default {
    name: 'App',
    data() {
      return {
        foo: 'foo',
        boo: 'boo',
        coo: 'coo',
        doo: 'doo',
      };
    },
    components: {
      Son,
    },
    methods: {
      method1() {
        console.log('method1');
      },
      method2() {
        console.log('method2');
      },
    },
  };
</script>

// son.vue
<div>
  <h1>{{foo}}</h1>
  <grand-son v-bind="$attrs" v-on="$listeners" />
</div>

<script>
  import GrandSon from './grandSon.vue';
  export default {
    components: {
      GrandSon,
    },
    inheritAttrs: true,
    props: {
      foo: String,
    },
    created() {
      console.log(this.$attrs); // {boo: "boo", coo: "coo", doo: "doo"}
      console.log(this.$listeners); // {method1: ƒ, method2: ƒ}
    },
  };
</script>

// grandSon.vue
<template>
  <div>
    <h2>boo: {{boo}}</h2>
  </div>
</template>

<script>
  export default {
    props: {
      boo: String,
    },
    created() {
      console.log(this.$attrs); // {coo: "coo", doo: "doo"}
      console.log(this.$listeners); // {method1: ƒ, method2: ƒ}
    },
  };
</script>
```

`$attrs`表示没有继承数据的对象，格式为{属性名：属性值}。`Vue2.4`提供了`$attrs` ,`$listeners` 来传递数据与事件，跨级组件之间的通讯变得更简单。

### 五、`provide` / `inject`

`Vue2.2.0`以上允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效。一言而蔽之：祖先组件中通过`provider`来提供变量，然后在子孙组件中通过`inject`来注入变量。

`provide` / `inject` API 主要解决了跨级组件间的通信问题，不过它的使用场景，主要是子组件获取上级组件的状态，跨级组件间建立了一种主动提供与依赖注入的关系。

```html
// father.vue
<Son />

<script>
  import Son from './son.vue';

  export default {
    name: 'App',
    provide: {
      eoo: 'eoo',
    },
  };
</script>

// son.vue
<div>
  <h1>{{eoo}}</h1>
</div>

<script>
  export default {
    inject: ['eoo'],
    created() {
      console.log(this.eoo);
    },
  };
</script>
```

需要注意的是：`provide` 和 `inject` 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。也就是说当父组件的`eoo`值变动时，子组件的`eoo`值并不会改变。

#### `provide`与`inject` 实现数据响应式

一般来说，有两种办法：

- `provide`祖先组件的实例，然后在子孙组件中注入依赖，这样就可以在子孙组件中直接修改祖先组件的实例的属性，不过这种方法有个缺点就是这个实例上挂载很多没有必要的东西比如`props`，`methods`。

- 使用 Vue.observable 优化响应式 `provide`

```js
// 父组件
provide() {
  return {
    global: this
  }
},

// 子组件
inject: {
  global: {
    //函数式组件取值不一样
    default: () =>({})
  }
}
```

## 父组件监听子组件生命周期

比如有父组件 `Parent` 和子组件 `Child`，如果父组件监听到子组件挂载 `mounted` 就做一些逻辑处理，可以通过以下写法实现：

```js
// Parent.vue
<Child @mounted="doSomething"/>

// Child.vue
mounted() {
  this.$emit("mounted");
}
```

以上需要手动通过 `$emit` 触发父组件的事件，更简单的方式可以在父组件引用子组件时通过 `@hook` 来监听即可，如下所示：

```js
//  Parent.vue
<Child @hook:mounted="doSomething" ></Child>

doSomething() {
   console.log('父组件监听到 mounted 钩子函数 ...');
},

//  Child.vue
mounted(){
   console.log('子组件触发 mounted 钩子函数 ...');
},

// 以上输出顺序为：
// 子组件触发 mounted 钩子函数 ...
// 父组件监听到 mounted 钩子函数 ...
```

当然 `@hook` 方法不仅仅是可以监听 `mounted`，其它的生命周期事件，例如：`created`，`updated`等都可以监听。

## 数组赋值

由于 `JavaScript` 的限制，`Vue` 不能检测到以下数组的变动：

- 当你利用索引直接设置一个数组项时，例如：`vm.items[indexOfItem] = newValue`
- 当你修改数组的长度时，例如：`vm.items.length = newLength`

为了解决第一个问题，`Vue` 提供了以下操作方法：

```js
// Vue.set
Vue.set(vm.items, indexOfItem, newValue);
// vm.$set，Vue.set的一个别名
vm.$set(vm.items, indexOfItem, newValue);
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue);
```

为了解决第二个问题，Vue 提供了以下操作方法：

```js
// Array.prototype.splice
vm.items.splice(newLength);
```

## `keep-alive`

`keep-alive` 是 `Vue` 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 ，其有以下特性：

- 一般结合路由和动态组件一起使用，用于缓存组件；
- 提供 `include` 和 `exclude` 属性，两者都支持字符串或正则表达式， `include` 表示只有名称匹配的组件会被缓存，`exclude` 表示任何名称匹配的组件都不会被缓存 ，其中 `exclude` 的优先级比 `include` 高；
- 对应两个钩子函数 `activated` 和 `deactivated` ，当组件被激活时，触发钩子函数 `activated`，当组件被移除时，触发钩子函数 `deactivated`。

## `data`为何是一个函数

```js
data() {
  return {
    name: "data"
  }
}
```

因为组件是用来复用的，且 `JS` 里对象是引用关系，如果组件中 `data` 是一个对象，那么这样作用域没有隔离，子组件中的 `data` 属性值会相互影响，如果组件中 `data` 选项是一个函数，那么每个实例可以维护一份被返回对象的独立的拷贝，组件实例之间的 `data` 属性值不会互相影响。

## `v-model`原理

我们在 `vue` 项目中主要使用 `v-model` 指令在表单 `input`、`textarea`、`select` 等元素上创建双向数据绑定，我们知道 `v-model` 本质上不过是语法糖，`v-model` 在内部为不同的输入元素使用不同的属性并抛出不同的事件：

- `text` 和 `textarea` 元素使用 `value` 属性和 `input` 事件；
- `checkbox`和 `radio` 使用 `checked` 属性和 `change` 事件；
- `select` 字段将 `value` 作为 `prop` 并将 `change` 作为事件。

以 `input` 表单元素为例：

```html
<input v-model="something" />
```

相当于

```html
<input v-bind:value="something" v-on:input="something = $event.target.value" />
```

如果在自定义组件中，`v-model` 默认会利用名为 `value` 的 `prop` 和名为 `input` 的事件，如下所示：

父组件：

```html
<ModelChild v-model="message"></ModelChild>
```

子组件：

```js
<div>{{value}}</div>

props:{
    value: String
},
methods: {
  test1(){
     this.$emit('input', '小红')
  },
},
```

## `Vue SSR`

> `Vue.js` 是构建客户端应用程序的框架。默认情况下，可以在浏览器中输出 `Vue` 组件，进行生成 `DOM` 和操作 `DOM`。然而，也可以将同一个组件渲染为服务端的 `HTML` 字符串，将它们直接发送到浏览器，最后将这些静态标记"激活"为客户端上完全可交互的应用程序。
> 即：`SSR`大致的意思就是`vue`在客户端将标签渲染成的整个 `html` 片段的工作在服务端完成，服务端形成的`html` 片段直接返回给客户端这个过程就叫做服务端渲染。

**优点：**

- 更好的 `SEO`：因为 `SPA` 页面的内容是通过 `Ajax` 获取，而搜索引擎爬取工具并不会等待`Ajax` 异步完成后再抓取页面内容，所以在 `SPA` 中是抓取不到页面通过 `Ajax` 获取到的内容；而`SSR` 是直接由服务端返回已经渲染好的页面（数据已经包含在页面中），所以搜索引擎爬取工具可以抓取渲染好的页面；

- 更快的内容到达时间（首屏加载更快）：`SPA` 会等待所有 `Vue` 编译后的 `js` 文件都下载完成后，才开始进行页面的渲染，文件下载等需要一定的时间等，所以首屏渲染需要一定的时间；`SSR` 直接由服务端渲染好页面直接返回显示，无需等待下载 `js` 文件及再去渲染等，所以 `SSR` 有更快的内容到达时间；

**缺点：**

- 更多的开发条件限制：例如服务端渲染只支持 `beforCreate` 和 `created` 两个钩子函数，这会导致一些外部扩展库需要特殊处理，才能在服务端渲染应用程序中运行；并且与可以部署在任何静态文件服务器上的完全静态单页面应用程序 `SPA` 不同，服务端渲染应用程序，需要处于 `Node.js server` 运行环境；
- 更多的服务器负载：在 `Node.js` 中渲染完整的应用程序，显然会比仅仅提供静态文件的 `server` 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)，因此如果你预料在高流量环境 ( `high traffic` ) 下使用，请准备相应的服务器负载，并明智地采用缓存策略。

## `vue-router`路由模式

1. `hash`: 使用 `URL hash` 值来作路由。支持所有浏览器，包括不支持 `HTML5 History Api` 的浏览器。  
   实现原理：早期的前端路由的实现就是基于 `location.hash` 来实现的。其实现原理很简单，`location.hash` 的值就是 `URL` 中 `#`后面的内容。

```js
http://localhost:8080/#/example
// hash为 #/example
```

特性：

- `URL` 中 `hash` 值只是客户端的一种状态，也就是说当向服务器端发出请求时，`hash` 部分不会被发送；
- `hash` 值的改变，都会在浏览器的访问历史中增加一个记录。因此我们能通过浏览器的回退、前进按钮控制`hash` 的切换；
- 可以通过 `a` 标签，并设置 `href` 属性，当用户点击这个标签后，`URL` `hash` 值会发生改变；或者使用 `JavaScript` 来对 `loaction.hash` 进行赋值，改变 `URL` 的 `hash` 值；
- 可以使用 `hashchange` 事件来监听 `hash` 值的变化，从而对页面进行跳转（渲染）。

2. `history`: `HTML5` 提供了 `History API` 来实现 `URL` 的变化。其中做最主要的 `API` 有以下两个：`history.pushState()` 和 `history.repalceState()`。这两个 `API` 可以在不进行刷新的情况下，操作浏览器的历史纪录。唯一不同的是，前者是新增一个历史记录，后者是直接替换当前的历史记录。

特性：

- `pushState` 和 `repalceState` 两个 `API` 来操作实现 `URL` 的变化 ；
- 我们可以使用 `popstate` 事件来监听 `url` 的变化，从而对页面进行跳转（渲染）；
- `history.pushState()` 或 `history.replaceState()` 不会触发 `popstate` 事件，这时我们需要手动触发页面跳转（渲染）.
