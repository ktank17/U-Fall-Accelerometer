package com.reactive.secretcamera.activities;

import android.Manifest;
import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;


import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.reactive.secretcamera.Adapter.ImageAdapter;
import com.reactive.secretcamera.Constants;
import com.reactive.secretcamera.R;
import com.reactive.secretcamera.Sensor.Accelerometer;
import com.reactive.secretcamera.Sensor.AdvanceSensor;
import com.reactive.secretcamera.listeners.PictureCapturingListener;
import com.reactive.secretcamera.services.APictureCapturingService;
import com.reactive.secretcamera.services.PictureCapturingServiceImpl;
import com.reactive.secretcamera.services.SecretCamService;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TreeMap;


/**
 * App's Main Activity showing a simple usage of the picture taking service.
 * @author hzitoun (zitoun.hamed@gmail.com)
 */
public class MainActivity extends AppCompatActivity implements PictureCapturingListener, ActivityCompat.OnRequestPermissionsResultCallback {

    private static final String[] requiredPermissions = {
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.CAMERA,
    };
    private static final int MY_PERMISSIONS_REQUEST_ACCESS_CODE = 1;
    private static final String TAG = MainActivity.class.getSimpleName();
    private SensorManager mSensorManager;
    private Sensor mSensor;

    private ImageView uploadBackPhoto;
    private ImageView uploadFrontPhoto;
    private RecyclerView recyclerView;
    private Button action;
    private List<Bitmap> list = new ArrayList<>();
    ImageAdapter adapter ;
    Accelerometer accelerometer;
    public static AdvanceSensor advanceSensor;
    
     //The capture service          
    private APictureCapturingService pictureService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        checkPermissions();
        recyclerView=findViewById(R.id.recycler);
        action=findViewById(R.id.action);
        // getting instance of the Service from PictureCapturingServiceImpl

        mSensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        mSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        accelerometer = new Accelerometer(mSensorManager, mSensor, mHandler);
        advanceSensor=new AdvanceSensor(MainActivity.this,mHandler);
        recyclerView.hasFixedSize();
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ImageAdapter(this,list);
        recyclerView.setAdapter(adapter);
        pictureService = PictureCapturingServiceImpl.getInstance(this);
        action.setOnClickListener(v -> {
               showToast("Starting Sensor!");
            Intent serviceIntent=new Intent(this, SecretCamService.class);
            ContextCompat.startForegroundService(this,serviceIntent);

               //accelerometer.startListening();

        });
    }
    
    private void showToast(final String text) {
        runOnUiThread(() ->
                Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT).show()
        );
    }

    /**
    * We've finished taking pictures from all phone's cameras
    */    
    @Override
    public void onDoneCapturingAllPhotos(TreeMap<String, byte[]> picturesTaken) {
        if (picturesTaken != null && !picturesTaken.isEmpty()) {
            return;
        }
        showToast("No camera detected!");
    }

    /**
    * Displaying the pictures taken.
    */             
    @Override
    public void onCaptureDone(String pictureUrl, byte[] pictureData) {
        if (pictureData != null && pictureUrl != null) {
            runOnUiThread(() -> {
                final Bitmap bitmap = BitmapFactory.decodeByteArray(pictureData, 0, pictureData.length);
                final int nh = (int) (bitmap.getHeight() * (512.0 / bitmap.getWidth()));
                final Bitmap scaled = Bitmap.createScaledBitmap(bitmap, 512, nh, true);
                Log.i(TAG,pictureUrl);
                list.add(scaled);
                adapter.notifyDataSetChanged();
            });
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String permissions[], @NonNull int[] grantResults) {
        switch (requestCode) {
            case MY_PERMISSIONS_REQUEST_ACCESS_CODE: {
                if (!(grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    checkPermissions();
                }
            }
        }
    }

    /**
     * checking  permissions at Runtime.
     */
    @TargetApi(Build.VERSION_CODES.M)
    private void checkPermissions() {
        final List<String> neededPermissions = new ArrayList<>();
        for (final String permission : requiredPermissions) {
            if (ContextCompat.checkSelfPermission(getApplicationContext(),
                    permission) != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(permission);
            }
        }
        if (!neededPermissions.isEmpty()) {
            requestPermissions(neededPermissions.toArray(new String[]{}),
                    MY_PERMISSIONS_REQUEST_ACCESS_CODE);
        }
    }
    private final Handler mHandler = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case Constants.MESSAGE_CHANGED:
                    float value = msg.getData().getFloat(Constants.VALUE);
                    Log.i(TAG,value+" Sudden Movement");
                    break;
                case Constants.MESSAGE_EMERGENCY:
//                    mToggle.setChecked(true);
                    Toast.makeText(MainActivity.this, "Emergency!!!", Toast.LENGTH_SHORT).show();
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            pictureService.startCapturing(MainActivity.this);
                            //advanceSensor.onDestroy();
                            //accelerometer.stopListening();
                        }
                    });
                    break;
                case Constants.MESSAGE_TOAST:
                    break;
            }
        }
    };

}

