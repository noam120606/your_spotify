import Fuse from "fuse.js";

import { AlbumModel, InfosModel, TrackModel } from "../Models";
import { User } from "../schemas/user";

export const getAlbums = (albumsId: string[]) => AlbumModel.find({ id: { $in: albumsId } });

export const getAlbumInfos = (albumId: string) => [
  {
    $lookup: {
      from: "tracks",
      let: { targetId: "$id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$album", albumId] }, { $eq: ["$id", "$$targetId"] }],
            },
          },
        },
        { $project: { trackId: "$id", albumId: "$album" } },
      ],
      as: "albumInfos",
    },
  },
  { $match: { "albumInfos.albumId": { $exists: true } } },
  { $unwind: "$albumInfos" },
];

export const getFirstAndLastListenedAlbum = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, albumId: albumId } },
    ...getAlbumInfos(albumId),
    { $sort: { played_at: 1 } },
    {
      $group: {
        _id: null,
        first: { $first: "$$ROOT" },
        last: { $last: "$$ROOT" },
      },
    },
    ...["first", "last"]
      .map((e) => [
        {
          $lookup: {
            from: "tracks",
            localField: `${e}.albumInfos.trackId`,
            foreignField: "id",
            as: `${e}.track`,
          },
        },
        { $unwind: `$${e}.track` },
      ])
      .flat(1),
  ]);
  return res[0];
};

export const getAlbumSongs = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, albumId: albumId } },
    ...getAlbumInfos(albumId),
    { $group: { _id: "$id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "tracks",
        localField: "_id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
  ]);
  return res;
};

export const searchAlbum = async (query: string) => {
  const albums = await AlbumModel.find({
    name: { $regex: query, $options: "i" },
  }).lean();
  const fuse = new Fuse(albums, {
    keys: ["name"],
  });
  return fuse.search(query).map((r) => r.item);
};

export const getTotalListeningOfAlbum = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, albumId: albumId } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  return res[0];
};

export const getAlbumTotalStats = async (albumId: string) => {
  const res = await TrackModel.aggregate([
    { $match: { album: albumId } },
    {
      $group: {
        _id: null,
        totalTracks: { $sum: 1 },
        totalDurationMs: { $sum: "$duration_ms" },
      },
    },
  ]);
  return res[0] || { totalTracks: 0, totalDurationMs: 0 };
};
