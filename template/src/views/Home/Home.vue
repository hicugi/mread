<script src="./Home.js"></script>

<template>
  <section v-if="onTop" class="p-home-top">
    <div
      class="p-home-top__bg"
      :style="{ backgroundImage: 'url(' + onTop.image + ')' }"
    />

    <div class="container">
      <div class="p-home-top__hint">BESTONE</div>
      <h2>{{ onTop.name }}</h2>

      <UiButton
        class="p-home-top__btn"
        :link="{ name: 'details', params: { alias: onTop.alias } }"
        variant="primary"
        size="large"
        >
        <img :src="iconRead" width="22px" />
        <span>Read Now</span>
      </UiButton
      >
    </div>
  </section>

  <section class="p-home__list container">
    <h2>Editor's Picks</h2>

    <div class="p-home-items">
      <Card
        v-for="(item, index) of combinedList"
        :key="`online${item.alias}`"
        v-bind="item"
      />
    </div>

    <footer class="c-mangaList__footer">
      <UiButton type="button" @click="clearTemplate">update template</UiButton>
      <UiButton variant="danger" @click="clearAll">clear all cache</UiButton>
    </footer>
  </section>
</template>

<style>
.p-home-top {
  z-index: 0;
  position: relative;
  height: 574px;
  display: grid;
  grid-template-columns: 1fr;
  align-items: flex-end;
}

.p-home-top__bg {
  z-index: -1;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 740px;
  height: 100%;
  background: no-repeat top;
  background-size: 100% auto;
}
.p-home-top__bg::before {
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #0e0e0e99,
    #0e0e0ecd 60%,
    #0e0e0e 100%
  );
  content: "";
}

.p-home-top__hint {
  padding: 0 8px;
  display: inline-block;
  border-radius: 6px;
  background: #9ba8ff33;
  color: var(--color-primary);
  font-size: 10px;
  line-height: 23px;
}
.p-home-top h2 {
  margin: 16px 0 40px;
  font-size: 48px;
  line-height: 1;
}

.p-home-top__btn {
  width: 100%;
  gap: 8px;
}

.p-home__list h2 {
  margin: 40px 0 24px;
  font-size: 24px;
  font-weight: bold;
  line-height: 32px;
}
.p-home-items {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.c-mangaList-saved .c-mangaList-items {
  margin-bottom: 40px;
}

.c-mangaList__cache-btm {
  margin: 40px 0;
  padding: 20px 0;
  width: 100%;
  display: block;
}

.c-mangaList__footer {
  padding: 30px 15px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
</style>
