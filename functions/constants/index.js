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
        'Mengubah config default folder atau password, tanpa karakter [ dan ]',
    },
  ],
};
