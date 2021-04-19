package com.reactive.secretcamera.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.reactive.secretcamera.R;
import com.reactive.secretcamera.Sensor.Accelerometer;
import com.reactive.secretcamera.activities.MainActivity;

public class SecretCamService extends Service {

    private final String TAG=SecretCamService.class.getSimpleName();

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG,"onCreate Service");
        MainActivity.advanceSensor.start();

    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    @Override
    public void onDestroy() {
        Log.i(TAG,"ondestroye job");
        super.onDestroy();
        MainActivity.advanceSensor.onDestroy();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
       /* Messenger callback = intent.getParcelableExtra("messenger");
        Message m = Message.obtain();*/
        /*m.what = 2;
        m.obj = this;*/
       /* try {
            callback.send(m);
        } catch (RemoteException e) {
            Log.e(TAG, "Error passing service object back to activity.");
        }*/
        createNotificationChannel();
        NotificationCompat.Builder builder=new NotificationCompat.Builder(this,"12");
        Notification notification = builder.setOngoing(true)
                .setSmallIcon(R.drawable.accident)
                .setContentTitle("Falling App")
                .setContentText("Falling Detection App Service")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .build()
                ;

        startForeground(1,notification);
        return START_NOT_STICKY;
    }
    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = getString(R.string.channel_name);
            String description = getString(R.string.channel_description);
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel("12", name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
