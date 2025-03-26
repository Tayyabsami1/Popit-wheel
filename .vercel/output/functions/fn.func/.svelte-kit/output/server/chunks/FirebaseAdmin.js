import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { FirebaseError } from "firebase/app";
import { f as firebaseConfig } from "./Firebase.js";
import { a as addIdsToEntries } from "./Wheel.js";
import { readFileSync } from "fs";
import { G as GOOGLE_APPLICATION_CREDENTIALS } from "./private.js";
const serviceAccount = JSON.parse(readFileSync(GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  getApp();
}
try {
  initializeApp(firebaseConfig);
} catch (error) {
  if (error instanceof FirebaseError && error.code !== "app/duplicate-app") {
    console.error(error);
  }
}
const db = getFirestore();
const getWheel = async (path, uid) => {
  const metaSnap = await db.doc(`wheel-meta/${path}`).get();
  if (!metaSnap.exists) {
    return null;
  }
  const meta = metaSnap.data();
  if (meta.visibility === "private" && meta.uid !== uid) {
    return null;
  }
  const wheelSnap = await db.doc(`wheels/${path}`).get();
  if (wheelSnap.exists) {
    return wheelSnap.data();
  }
  return null;
};
const getUserWheelsMeta = async (uid) => {
  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) {
    return [];
  }
  const user = userSnap.data();
  if (!user.wheels.length) {
    return [];
  }
  return await getWheelMetaForPaths(user.wheels);
};
const getWheelMetaForPaths = async (paths) => {
  const metaSnaps = await db.getAll(
    ...paths.map((path) => db.doc(`wheel-meta/${path}`))
  );
  return metaSnaps.map(
    (snap) => snap.data()
  ).map((meta) => ({
    ...meta,
    created: meta.created._seconds * 1e3,
    updated: meta.updated ? meta.updated._seconds * 1e3 : null
  }));
};
const saveWheel = async (wheel, uid, visibility) => {
  const userDoc = await db.doc(`users/${uid}`).get();
  if (!userDoc.exists) {
    return null;
  }
  const path = await getNewWheelPath();
  await db.collection("wheel-meta").doc(path).create({
    path,
    uid,
    visibility,
    created: /* @__PURE__ */ new Date(),
    updated: null,
    title: wheel.config.title,
    views: 0
  });
  await db.collection("wheels").doc(path).create(
    {
      path,
      config: wheel.config,
      entries: addIdsToEntries(wheel.entries)
    }
  );
  const user = userDoc.data();
  await db.doc(`users/${uid}`).update({
    wheels: [...user.wheels, path]
  });
  return path;
};
const updateWheel = async (path, wheel, uid, visibility) => {
  const metaDoc = db.doc(`wheel-meta/${path}`);
  const metaSnap = await metaDoc.get();
  if (!metaSnap.exists) {
    return null;
  }
  const meta = metaSnap.data();
  if (meta.uid !== uid) {
    return null;
  }
  const newMeta = { updated: /* @__PURE__ */ new Date() };
  if (wheel.config && wheel.config.title !== meta.title) {
    newMeta.title = wheel.config.title;
  }
  if (visibility) {
    newMeta.visibility = visibility;
  }
  await metaDoc.update(newMeta);
  const wheelDoc = db.doc(`wheels/${path}`);
  await wheelDoc.update({
    config: wheel.config,
    entries: wheel.entries ? addIdsToEntries(wheel.entries) : void 0
  });
  return meta.path;
};
const deleteWheel = async (path, uid) => {
  const userDoc = await db.doc(`users/${uid}`).get();
  if (!userDoc.exists) {
    return null;
  }
  const user = userDoc.data();
  if (!user.wheels.includes(path)) {
    return null;
  }
  await Promise.all([
    db.doc(`users/${uid}`).update({
      wheels: user.wheels.filter((wheel) => wheel !== path)
    }),
    db.doc(`wheel-meta/${path}`).delete(),
    db.doc(`wheels/${path}`).delete()
  ]);
  return true;
};
const getNewWheelPath = async () => {
  let path;
  let snap;
  do {
    path = getRandomPath();
    snap = await db.doc(`wheel-meta/${path}`).get();
  } while (snap.exists);
  return path;
};
const getRandomPath = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).toSpliced(3, 0, "-").join("");
};
export {
  getWheel as a,
  deleteWheel as d,
  getUserWheelsMeta as g,
  saveWheel as s,
  updateWheel as u
};
