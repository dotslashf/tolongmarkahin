module.exports = {
  commands: [
    {
      command: '/buatFolder',
      alias: [
        '/createFolder',
        '/cf',
        '/newFolder',
        '/nf',
        '/tambahFolder',
        '/tf',
        '/addFolder',
        '/af',
      ],
      help: '/buatFolder [namafolder]',
      description:
        'Membuat folder, nama folder tidak boleh menggunakan spasi, tanpa karakter [ dan ]',
    },
    {
      command: '/ke',
      help: '/ke [namafolder] [link tweet]',
      alias: ['/to'],
      description:
        'Menyimpan bookmark pada folder spesifik, link tweet bookmark dapat lebih dari satu, tanpa karakter [ dan ]',
    },
    {
      command: '/listFolder',
      alias: ['/listFolders', '/lf'],
      help: '',
      description: 'Memunculkan list folder bookmark',
    },
    {
      command: '/help',
      help: '',
      description: 'Menampilkan pesan ini',
    },
    {
      command: '/getConfig',
      alias: ['/config', '/gf'],
      help: '',
      description: 'Menampilkan config',
    },
    {
      command: '/setConfig',
      alias: ['/sc'],
      help: '/setConfig defaultFolder [namafolder] | password [passwordBaru]',
      description:
        'Mengubah config default folder atau password, tanpa karakter [ dan ]\n cth:\nMengubah password:\n\n /setConfig password passwordBaru \nMengubah default folder:\n\n /setConfig defaultFolder namaFolder',
    },
    {
      command: '/renameFolder',
      alias: ['/rename', '/rf'],
      help: '/renameFolder [namaFolderLama] [namaFolderBaru]',
      description:
        'Mengubah nama folder, nama folder tidak boleh menggunakan spasi, tanpa karakter [ dan ]',
    },
    {
      command: '/deleteFolder',
      alias: ['/delete', '/df'],
      help: '/deleteFolder [namaFolder]',
      description:
        'Menghapus folder dan semua bookmark yang ada di dalamnya, nama folder tidak boleh menggunakan spasi, tanpa karakter [ dan ]',
    },
    {
      command: '/web',
      alias: ['/app', '/link'],
      help: 'mengirim link web',
      description: 'mengirim link web',
    },
  ],
};
