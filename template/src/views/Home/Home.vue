<script src="./Home.js"></script>

<template>
  <Cover v-if="onTop" class="p-home-top" :image="onTop.image">
    <div class="p-home-top__tags">
      <span>{{ onTop.currentChapter ? 'LAST READ' : 'BESTONE' }}</span>
    </div>

    <h2>{{ onTop.name }}</h2>

    <div class="p-home-top__footer">
      <UiButton
        :link="{ name: 'details', params: { alias: onTop.alias } }"
        variant="primary"
        size="large"
        >
        <img :src="iconRead" width="22px" />
        <span>Open Details</span>
      </UiButton>
      <UiButton
        v-if="savedChapters[onTop.alias]"
        :link="{ name: 'chapter', params: { alias: onTop.alias, chapter: savedChapters[onTop.alias] } }"
        size="large"
        >
        <span>Ch. {{ savedChapters[onTop.alias] }}</span>
        <img :src="iconContinue" width="20px" />
      </UiButton>
    </div>
  </Cover>

  <section class="p-home__list container">
    <h2>Editor's Picks</h2>

    <div class="p-home-items">
      <Card
        v-for="(item, index) of combinedList"
        :key="`${item?.alias}-${index}`"
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
.p-home-top__tags {
  display: flex;
  gap: 12px;
}
.p-home-top__tags span {
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

.p-home-top__footer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}
.p-home-top__footer a {
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
